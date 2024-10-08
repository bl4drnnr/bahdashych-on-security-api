import * as uuid from 'uuid';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Author } from '@models/author.model';
import { Experience } from '@models/experience.model';
import { ExperiencePosition } from '@models/experience-position.model';
import { Cert } from '@models/cert.model';
import { Social } from '@models/social.model';
import { GetSelectedAuthorInterface } from '@interfaces/get-selected-author.interface';
import { ListExperiencesInterface } from '@interfaces/list-experiences.interface';
import { CreateAuthorInterface } from '@interfaces/create-author.interface';
import { ApiConfigService } from '@shared/config.service';
import { S3 } from 'aws-sdk';
import { WrongPictureException } from '@exceptions/wrong-picture.exception';
import { CryptoHashAlgorithm } from '@interfaces/crypto-hash-algorithm.enum';
import { CryptographicService } from '@shared/cryptographic.service';
import { AuthorCreatedDto } from '@dto/author-created.dto';
import { ChangeAuthorSelectionStatusInterface } from '@interfaces/change-author-selection-status.interface';
import { AuthorNotFoundException } from '@exceptions/author-not-found.exception';
import { AuthorSelectionStatusUpdatedDto } from '@dto/author-selection-status-updated.dto';
import { UpdateAuthorInterface } from '@interfaces/update-author.interface';
import { GetAuthorByIdInterface } from '@interfaces/get-author-by-id.interface';
import { AuthorUpdatedDto } from '@dto/author-updated.dto';
import { DeleteAuthorInterface } from '@interfaces/delete-author.interface';
import { AuthorDeletedDto } from '@dto/author-deleted.dto';
import { GetExperienceByIdInterface } from '@interfaces/get-experience-by-id.interface';
import { CreateExperienceInterface } from '@interfaces/create-experience.interface';
import { StaticStorages } from '@interfaces/static-storages.enum';
import { ExperienceCreatedDto } from '@dto/experience-created.dto';
import { UpdateExperienceInterface } from '@interfaces/update-experience.interface';
import { ExperienceNotFoundException } from '@exceptions/experience-not-found.exception';
import { ExperienceUpdatedDto } from '@dto/experience-updated.dto';
import { DeleteExperienceInterface } from '@interfaces/delete-experience.interface';
import { ExperienceDeletedDto } from '@dto/experience-deleted.dto';
import { ParseException } from '@exceptions/parse.exception';
import { Op } from 'sequelize';
import { ListExperiencesDto } from '@dto/list-experiences.dto';
import { ListCertifications } from '@interfaces/list-certifications.interface';
import { ListCertificationsDto } from '@dto/list-certifications.dto';
import { ListAuthorsInterface } from '@interfaces/list-authors.interface';
import { ListAuthorsDto } from '@dto/list-authors.dto';
import { GetCertificationById } from '@interfaces/get-certification-by-id.interface';
import { CreateCertificationInterface } from '@interfaces/create-certification.interface';
import { CertificationCreatedDto } from '@dto/certification-created.dto';
import { UpdateCertificationInterface } from '@interfaces/update-certification.interface';
import { CertificationNotFoundException } from '@exceptions/certification-not-found.exception';
import { CertificationUpdatedDto } from '@dto/certification-updated.dto';
import { DeleteCertificationInterface } from '@interfaces/delete-certification.interface';
import { CertificationDeletedDto } from '@dto/certification-deleted.dto';
import { ChangeExperienceSelectionStatusInterface } from '@interfaces/change-experience-selection-status.interface';
import { ExperienceSelectionStatusUpdatedDto } from '@dto/experience-selection-status-updated.dto';
import { ChangeCertificationSelectionStatusInterface } from '@interfaces/change-certification-selection-status.interface';
import { CertificationSelectionStatusUpdatedDto } from '@dto/certification-selection-status-updated.dto';
import { CertificationFileUploadedDto } from '@dto/certification-file-uploaded.dto';
import { CreateCertificationPosition } from '@interfaces/create-certification-position.interace';
import { ExperiencePositionCreatedDto } from '@dto/experience-position-created.dto';
import { UpdateExperiencePositionInterface } from '@interfaces/update-experience-position.interface';
import { ExperiencePositionUpdatedDto } from '@dto/experience-position-updated.dto';
import { GetExperiencePositionByIdInterface } from '@interfaces/get-experience-position-by-id.interface';
import { ExperiencePositionNotFoundException } from '@exceptions/experience-position-not-found.exception';
import { ExperiencePositionDeletedDto } from '@dto/experience-position-deleted.dto';
import { CreateSocialInterface } from '@interfaces/create-social.interface';
import { SocialCreatedDto } from '@dto/social-created.dto';
import { UpdateSocialInterface } from '@interfaces/update-social.interface';
import { GetSocialByIdInterface } from '@interfaces/get-social-by-id.interface';
import { SocialNotFoundException } from '@exceptions/social-not-found.exception';
import { SocialUpdatedDto } from '@dto/social-updated.dto';
import { DeleteSocialInterface } from '@interfaces/delete-social.interface';
import { SocialDeletedDto } from '@dto/social-deleted.dto';
import { GetAuthorsByCommonIdInterface } from '@interfaces/get-authors-by-common-id.interface';
import { GetCertificationsByCommonIdInterface } from '@interfaces/get-certifications-by-common-id.interface';
import { GetExperiencesByCommonIdInterface } from '@interfaces/get-experiences-by-common-id.interface';
import { CreatedExperience } from '@interfaces/created-experience.interface';

@Injectable()
export class AboutBlogService {
  constructor(
    @InjectModel(Author)
    private readonly authorsRepository: typeof Author,
    @InjectModel(Experience)
    private readonly experiencesRepository: typeof Experience,
    @InjectModel(ExperiencePosition)
    private readonly experiencePositionsRepository: typeof ExperiencePosition,
    @InjectModel(Cert)
    private readonly certsRepository: typeof Cert,
    @InjectModel(Social)
    private readonly socialsRepository: typeof Social,
    private readonly configService: ApiConfigService,
    private readonly cryptographicService: CryptographicService
  ) {}

  getAuthorById({ authorId, trx }: GetAuthorByIdInterface) {
    return this.authorsRepository.findByPk(authorId, {
      transaction: trx
    });
  }

  getAuthorsByCommonId({ authorCommonId, trx }: GetAuthorsByCommonIdInterface) {
    return this.authorsRepository.findAndCountAll({
      where: { authorCommonId },
      transaction: trx
    });
  }

  getSocialById({ socialId, trx }: GetSocialByIdInterface) {
    return this.socialsRepository.findByPk(socialId, {
      transaction: trx
    });
  }

  getExperienceById({ experienceId, trx }: GetExperienceByIdInterface) {
    const experiencePositionAttributes = [
      'id',
      'positionTitle',
      'positionDescription',
      'positionStartDate',
      'positionEndDate',
      'createdAt',
      'updatedAt'
    ];

    return this.experiencesRepository.findByPk(experienceId, {
      include: [
        {
          model: ExperiencePosition,
          attributes: experiencePositionAttributes
        }
      ],
      transaction: trx
    });
  }

  getExperiencesByCommonId({
    experienceCommonId,
    trx
  }: GetExperiencesByCommonIdInterface) {
    return this.experiencesRepository.findAndCountAll({
      where: { experienceCommonId },
      transaction: trx
    });
  }

  getExperiencePositionById({
    experiencePositionId,
    trx
  }: GetExperiencePositionByIdInterface) {
    const experiencePositionAttributes = [
      'id',
      'positionTitle',
      'positionDescription',
      'positionStartDate',
      'positionEndDate',
      'createdAt',
      'updatedAt'
    ];

    return this.experiencePositionsRepository.findByPk(experiencePositionId, {
      attributes: experiencePositionAttributes,
      transaction: trx
    });
  }

  getCertificationById({ certificationId, trx }: GetCertificationById) {
    return this.certsRepository.findByPk(certificationId, {
      transaction: trx
    });
  }

  getCertificationsByCommonId({
    certCommonId,
    trx
  }: GetCertificationsByCommonIdInterface) {
    return this.certsRepository.findAndCountAll({
      where: { certCommonId },
      transaction: trx
    });
  }

  async getSelectedAuthor({ authorLanguage, trx }: GetSelectedAuthorInterface) {
    return this.authorsRepository.findOne({
      where: { authorLanguage, isSelected: true },
      include: [
        { model: Social },
        { model: Cert, where: { isSelected: true, certLanguage: authorLanguage } },
        {
          model: Experience,
          where: { isSelected: true, experienceLanguage: authorLanguage },
          include: [
            {
              model: ExperiencePosition,
              where: { positionLanguage: authorLanguage }
            }
          ]
        }
      ],
      transaction: trx
    });
  }

  async listAuthors({
    query,
    page,
    pageSize,
    order,
    orderBy,
    trx
  }: ListAuthorsInterface) {
    const offset = Number(page) * Number(pageSize);
    const limit = Number(pageSize);

    const paginationParseError =
      isNaN(offset) || isNaN(limit) || offset < 0 || limit < 0;

    if (paginationParseError) throw new ParseException();

    const attributes = [
      'id',
      'firstName',
      'lastName',
      'description',
      'profilePicture',
      'isSelected',
      'authorLanguage',
      'authorCommonId',
      'createdAt',
      'updatedAt'
    ];

    const where = {};

    if (query) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${query}%` } },
        { lastName: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } }
      ];
    }

    const { rows, count } = await this.authorsRepository.findAndCountAll({
      where,
      attributes,
      limit,
      offset,
      order: [[order, orderBy]],
      transaction: trx
    });

    return new ListAuthorsDto(rows, count);
  }

  async listExperiences({
    query,
    page,
    pageSize,
    order,
    orderBy,
    trx
  }: ListExperiencesInterface) {
    const offset = Number(page) * Number(pageSize);
    const limit = Number(pageSize);

    const paginationParseError =
      isNaN(offset) || isNaN(limit) || offset < 0 || limit < 0;

    if (paginationParseError) throw new ParseException();

    const attributes = [
      'id',
      'companyName',
      'companyDescription',
      'companyLink',
      'companyLinkTitle',
      'companyPicture',
      'startDate',
      'endDate',
      'isSelected',
      'experienceLanguage',
      'experienceCommonId',
      'createdAt',
      'updatedAt'
    ];

    const where = {};

    if (query) {
      where[Op.or] = [
        { companyName: { [Op.iLike]: `%${query}%` } },
        { companyDescription: { [Op.iLike]: `%${query}%` } }
      ];
    }

    const { rows, count } = await this.experiencesRepository.findAndCountAll({
      where,
      attributes,
      limit,
      offset,
      order: [[order, orderBy]],
      transaction: trx
    });

    return new ListExperiencesDto(rows, count);
  }

  async listCertifications({
    query,
    page,
    pageSize,
    order,
    orderBy,
    trx
  }: ListCertifications) {
    const offset = Number(page) * Number(pageSize);
    const limit = Number(pageSize);

    const paginationParseError =
      isNaN(offset) || isNaN(limit) || offset < 0 || limit < 0;

    if (paginationParseError) throw new ParseException();

    const attributes = [
      'id',
      'certName',
      'certDescription',
      'certPicture',
      'certDocs',
      'obtainingDate',
      'expirationDate',
      'obtainedSkills',
      'isSelected',
      'certLanguage',
      'certCommonId',
      'createdAt',
      'updatedAt'
    ];

    const where = {};

    if (query) {
      where[Op.or] = [
        { certName: { [Op.iLike]: `%${query}%` } },
        { certDescription: { [Op.iLike]: `%${query}%` } }
      ];
    }

    const { rows, count } = await this.certsRepository.findAndCountAll({
      where,
      attributes,
      limit,
      offset,
      order: [[order, orderBy]],
      transaction: trx
    });

    return new ListCertificationsDto(rows, count);
  }

  async authorById({ authorId, trx }: GetAuthorByIdInterface) {
    const socialsAttributes = ['id', 'link', 'title', 'createdAt', 'updatedAt'];
    const certsAttributes = [
      'id',
      'certName',
      'certDescription',
      'certPicture',
      'certDocs',
      'obtainingDate',
      'expirationDate',
      'obtainedSkills',
      'isSelected',
      'createdAt',
      'updatedAt'
    ];
    const experiencesAttributes = [
      'id',
      'companyName',
      'companyDescription',
      'companyLink',
      'companyLinkTitle',
      'companyPicture',
      'startDate',
      'endDate',
      'isSelected',
      'createdAt',
      'updatedAt'
    ];
    const experiencesPositionsAttributes = [
      'id',
      'positionTitle',
      'positionDescription',
      'positionStartDate',
      'positionEndDate',
      'createdAt',
      'updatedAt'
    ];

    const author = await this.getAuthorById({ authorId, trx });

    if (!author) throw new AuthorNotFoundException();

    return await this.authorsRepository.findByPk(authorId, {
      include: [
        { model: Social, attributes: socialsAttributes, required: false },
        {
          model: Cert,
          attributes: certsAttributes,
          where: { certLanguage: author.authorLanguage },
          required: false
        },
        {
          model: Experience,
          attributes: experiencesAttributes,
          where: { experienceLanguage: author.authorLanguage },
          required: false,
          include: [
            {
              model: ExperiencePosition,
              attributes: experiencesPositionsAttributes,
              required: false
            }
          ]
        }
      ],
      transaction: trx
    });
  }

  async createAuthor({ userId, payload, trx }: CreateAuthorInterface) {
    const { authors } = payload;

    const authorsIds: Array<string> = [];
    const authorCommonId = this.generateUUIDv4();

    for (const author of authors) {
      const authorPicture = await this.uploadPicture(
        author.profilePicture,
        StaticStorages.AUTHORS_PICTURES
      );

      const createdAuthor = await this.authorsRepository.create(
        {
          userId,
          firstName: author.firstName,
          lastName: author.lastName,
          title: author.title,
          profilePicture: authorPicture,
          description: author.description,
          authorLanguage: author.authorLanguage,
          authorCommonId
        },
        { transaction: trx }
      );

      authorsIds.push(createdAuthor.id);
    }

    return new AuthorCreatedDto(authorsIds);
  }

  async createSocial({ payload, trx }: CreateSocialInterface) {
    const { authorId, title, link } = payload;

    const author = await this.getAuthorById({ authorId, trx });

    if (!author) throw new AuthorNotFoundException();

    await this.socialsRepository.create(
      {
        authorId,
        title,
        link
      },
      { transaction: trx }
    );

    return new SocialCreatedDto();
  }

  async createExperience({ payload, trx }: CreateExperienceInterface) {
    const { experiences } = payload;

    const createdExperiences: Array<CreatedExperience> = [];
    const experienceCommonId = this.generateUUIDv4();

    for (const experience of experiences) {
      const experiencePicture = await this.uploadPicture(
        experience.companyPicture,
        StaticStorages.EXPERIENCES_PICTURES
      );

      const createdExperience = await this.experiencesRepository.create(
        {
          companyName: experience.companyName,
          companyDescription: experience.companyDescription,
          companyLink: experience.companyLink,
          companyLinkTitle: experience.companyLinkTitle,
          companyPicture: experiencePicture,
          obtainedSkills: experience.obtainedSkills,
          startDate: experience.startDate,
          endDate: experience.endDate,
          experienceLanguage: experience.experienceLanguage,
          experienceCommonId,
          authorId: experience.authorId
        },
        { transaction: trx }
      );

      createdExperiences.push({
        id: createdExperience.id,
        language: experience.experienceLanguage
      });
    }

    return new ExperienceCreatedDto(createdExperiences);
  }

  async createExperiencePosition({ payload, trx }: CreateCertificationPosition) {
    const {
      experienceId,
      positionStartDate,
      positionEndDate,
      positionTitle,
      positionDescription,
      positionLanguage
    } = payload;

    const experience = await this.getExperienceById({
      experienceId,
      trx
    });

    if (!experience) throw new ExperienceNotFoundException();

    const positionCommonId = this.generateUUIDv4();

    await this.experiencePositionsRepository.create(
      {
        experienceId,
        positionStartDate,
        positionEndDate,
        positionTitle,
        positionDescription,
        positionLanguage,
        positionCommonId
      },
      { transaction: trx }
    );

    return new ExperiencePositionCreatedDto();
  }

  async createCertification({ payload, trx }: CreateCertificationInterface) {
    const { certifications } = payload;

    const certificationCommonId = this.generateUUIDv4();

    for (const cert of certifications) {
      const certificationPicture = await this.uploadPicture(
        cert.certPicture,
        StaticStorages.CERTS_PICTURES
      );

      await this.certsRepository.create(
        {
          certName: cert.certName,
          certDescription: cert.certDescription,
          certPicture: certificationPicture,
          certDocs: cert.certDocs,
          obtainingDate: cert.obtainingDate,
          expirationDate: cert.expirationDate,
          obtainedSkills: cert.obtainedSkills,
          certLanguage: cert.certLanguage,
          certCommonId: certificationCommonId,
          authorId: cert.authorId
        },
        { transaction: trx }
      );
    }

    return new CertificationCreatedDto();
  }

  async updateAuthor({ payload, trx }: UpdateAuthorInterface) {
    const { authorId, firstName, lastName, profilePicture, description, title } =
      payload;

    const author = await this.getAuthorById({ authorId, trx });

    if (!author) throw new AuthorNotFoundException();

    const authorUpdatedFields: Partial<Author> = {};

    if (firstName) authorUpdatedFields.firstName = firstName;
    if (lastName) authorUpdatedFields.lastName = lastName;
    if (description) authorUpdatedFields.description = description;
    if (title) authorUpdatedFields.title = title;

    if (profilePicture) {
      await this.deleteFile(author.profilePicture, StaticStorages.AUTHORS_PICTURES);
      authorUpdatedFields.profilePicture = await this.uploadPicture(
        profilePicture,
        StaticStorages.AUTHORS_PICTURES
      );
    }

    await this.authorsRepository.update(
      { ...authorUpdatedFields },
      { where: { id: authorId }, transaction: trx }
    );

    return new AuthorUpdatedDto();
  }

  async updateSocial({ payload, trx }: UpdateSocialInterface) {
    const { socialId, link, title } = payload;

    const social = await this.getSocialById({ socialId, trx });

    if (!social) throw new SocialNotFoundException();

    const socialUpdatedFields: Partial<Social> = {};

    if (link) socialUpdatedFields.link = link;
    if (title) socialUpdatedFields.title = title;

    await this.socialsRepository.update(
      { ...socialUpdatedFields },
      { where: { id: socialId }, transaction: trx }
    );

    return new SocialUpdatedDto();
  }

  async updateExperience({ payload, trx }: UpdateExperienceInterface) {
    const {
      experienceId,
      companyDescription,
      companyLink,
      companyLinkTitle,
      companyPicture,
      companyName,
      obtainedSkills,
      startDate,
      endDate,
      authorId
    } = payload;

    const experience = await this.getExperienceById({
      experienceId,
      trx
    });

    if (!experience) throw new ExperienceNotFoundException();

    const experienceUpdatedFields: Partial<Experience> = {};

    if (companyName) experienceUpdatedFields.companyName = companyName;
    if (companyDescription)
      experienceUpdatedFields.companyDescription = companyDescription;
    if (companyLink) experienceUpdatedFields.companyLink = companyLink;
    if (companyLinkTitle)
      experienceUpdatedFields.companyLinkTitle = companyLinkTitle;
    if (startDate) experienceUpdatedFields.startDate = startDate;
    if (endDate || endDate === null) experienceUpdatedFields.endDate = endDate;
    if (obtainedSkills) experienceUpdatedFields.obtainedSkills = obtainedSkills;
    if (authorId) experienceUpdatedFields.authorId = authorId;
    if (companyPicture) {
      await this.deleteFile(
        experience.companyPicture,
        StaticStorages.AUTHORS_PICTURES
      );
      experienceUpdatedFields.companyPicture = await this.uploadPicture(
        companyPicture,
        StaticStorages.AUTHORS_PICTURES
      );
    }

    await this.experiencesRepository.update(
      { ...experienceUpdatedFields },
      { where: { id: experienceId }, transaction: trx }
    );

    return new ExperienceUpdatedDto();
  }

  async updateExperiencePosition({
    payload,
    trx
  }: UpdateExperiencePositionInterface) {
    const {
      experiencePositionId,
      positionStartDate,
      positionEndDate,
      positionTitle,
      positionDescription
    } = payload;

    const experiencePosition = await this.getExperiencePositionById({
      experiencePositionId,
      trx
    });

    if (!experiencePosition) throw new ExperiencePositionNotFoundException();

    const experienceUpdatedFields: Partial<ExperiencePosition> = {};

    if (positionStartDate)
      experienceUpdatedFields.positionStartDate = positionStartDate;
    if (positionEndDate) experienceUpdatedFields.positionEndDate = positionEndDate;
    if (positionTitle) experienceUpdatedFields.positionTitle = positionTitle;
    if (positionDescription)
      experienceUpdatedFields.positionDescription = positionDescription;

    await this.experiencePositionsRepository.update(
      { ...experienceUpdatedFields },
      { where: { id: experiencePositionId }, transaction: trx }
    );

    return new ExperiencePositionUpdatedDto();
  }

  async updateCertification({ payload, trx }: UpdateCertificationInterface) {
    const {
      certificationId,
      certName,
      certDescription,
      certPicture,
      certDocs,
      obtainingDate,
      expirationDate,
      obtainedSkills
    } = payload;

    const certificate = await this.getCertificationById({
      certificationId,
      trx
    });

    if (!certificate) throw new CertificationNotFoundException();

    const certificateUpdatedFields: Partial<Cert> = {};

    if (certName) certificateUpdatedFields.certName = certName;
    if (certDescription) certificateUpdatedFields.certDescription = certDescription;
    if (obtainingDate) certificateUpdatedFields.obtainingDate = obtainingDate;
    if (expirationDate || expirationDate === null)
      certificateUpdatedFields.expirationDate = expirationDate;
    if (obtainedSkills) certificateUpdatedFields.obtainedSkills = obtainedSkills;

    if (certDocs) {
      certificateUpdatedFields.certDocs = certDocs;
      await this.deleteFile(certificate.certDocs, StaticStorages.CERTS_FILES);
    }

    if (certPicture) {
      await this.deleteFile(certificate.certPicture, StaticStorages.CERTS_PICTURES);
      certificateUpdatedFields.certPicture = await this.uploadPicture(
        certPicture,
        StaticStorages.CERTS_PICTURES
      );
    }

    await this.certsRepository.update(
      { ...certificateUpdatedFields },
      { where: { id: certificationId }, transaction: trx }
    );

    return new CertificationUpdatedDto();
  }

  async deleteAuthor({ authorCommonId, trx }: DeleteAuthorInterface) {
    const authors = await this.getAuthorsByCommonId({ authorCommonId, trx });

    if (!authors || authors.count !== 3) throw new AuthorNotFoundException();

    for (const author of authors.rows) {
      await this.experiencesRepository.destroy({
        where: { authorId: author.id },
        cascade: true,
        transaction: trx
      });

      await this.certsRepository.destroy({
        where: { authorId: author.id },
        transaction: trx
      });

      await this.deleteFile(author.profilePicture, StaticStorages.AUTHORS_PICTURES);
    }

    await this.authorsRepository.destroy({
      where: { authorCommonId },
      transaction: trx
    });

    return new AuthorDeletedDto();
  }

  async deleteSocial({ socialId, trx }: DeleteSocialInterface) {
    const social = await this.getSocialById({ socialId, trx });

    if (!social) throw new SocialNotFoundException();

    await this.socialsRepository.destroy({
      where: { id: socialId },
      transaction: trx
    });

    return new SocialDeletedDto();
  }

  async deleteExperience({ experienceCommonId, trx }: DeleteExperienceInterface) {
    const experiences = await this.getExperiencesByCommonId({
      experienceCommonId,
      trx
    });

    if (!experiences || experiences.count !== 3)
      throw new ExperienceNotFoundException();

    for (const experience of experiences.rows) {
      await this.experiencePositionsRepository.destroy({
        where: { experienceId: experience.id },
        transaction: trx
      });

      await this.deleteFile(
        experience.companyPicture,
        StaticStorages.EXPERIENCES_PICTURES
      );
    }

    await this.experiencesRepository.destroy({
      where: { experienceCommonId },
      transaction: trx
    });

    return new ExperienceDeletedDto();
  }

  async deleteExperiencePosition({ experiencePositionId, trx }) {
    const experiencePosition = await this.getExperiencePositionById({
      experiencePositionId,
      trx
    });

    if (!experiencePosition) throw new ExperiencePositionNotFoundException();

    await this.experiencePositionsRepository.destroy({
      where: { id: experiencePositionId },
      transaction: trx
    });

    return new ExperiencePositionDeletedDto();
  }

  async deleteCertification({ certCommonId, trx }: DeleteCertificationInterface) {
    const certifications = await this.getCertificationsByCommonId({
      certCommonId,
      trx
    });

    if (!certifications || certifications.count !== 3)
      throw new CertificationNotFoundException();

    for (const cert of certifications.rows) {
      await this.deleteFile(cert.certPicture, StaticStorages.CERTS_PICTURES);

      await this.deleteFile(cert.certDocs, StaticStorages.CERTS_FILES);
    }

    await this.certsRepository.destroy({
      where: { certCommonId },
      transaction: trx
    });

    return new CertificationDeletedDto();
  }

  async changeAuthorSelectionStatus({
    payload,
    trx
  }: ChangeAuthorSelectionStatusInterface) {
    const { authorCommonId } = payload;

    const authors = await this.getAuthorsByCommonId({ authorCommonId, trx });

    if (!authors || authors.count !== 3) throw new AuthorNotFoundException();

    const authorUpdatedStatus = !authors.rows[0].isSelected;

    await this.authorsRepository.update(
      {
        isSelected: authorUpdatedStatus
      },
      { where: { authorCommonId }, transaction: trx }
    );

    await this.authorsRepository.update(
      {
        isSelected: false
      },
      { where: { authorCommonId: { [Op.not]: authorCommonId } }, transaction: trx }
    );

    return new AuthorSelectionStatusUpdatedDto(authorUpdatedStatus);
  }

  async changeExperienceSelectionStatus({
    payload,
    trx
  }: ChangeExperienceSelectionStatusInterface) {
    const { experienceCommonId } = payload;

    const experiences = await this.getExperiencesByCommonId({
      experienceCommonId,
      trx
    });

    if (!experiences || experiences.count !== 3)
      throw new ExperienceNotFoundException();

    const experienceUpdatedStatus = !experiences.rows[0].isSelected;

    await this.experiencesRepository.update(
      {
        isSelected: experienceUpdatedStatus
      },
      { where: { experienceCommonId }, transaction: trx }
    );

    return new ExperienceSelectionStatusUpdatedDto(experienceUpdatedStatus);
  }

  async changeCertificationSelectionStatus({
    payload,
    trx
  }: ChangeCertificationSelectionStatusInterface) {
    const { certCommonId } = payload;

    const certifications = await this.getCertificationsByCommonId({
      certCommonId,
      trx
    });

    if (!certifications || certifications.count !== 3)
      throw new CertificationNotFoundException();

    const certificationUpdatedStatus = !certifications.rows[0].isSelected;

    await this.certsRepository.update(
      {
        isSelected: certificationUpdatedStatus
      },
      { where: { certCommonId }, transaction: trx }
    );

    return new CertificationSelectionStatusUpdatedDto(certificationUpdatedStatus);
  }

  async certificationFileUpload(payload: Express.Multer.File) {
    const { accessKeyId, secretAccessKey, bucketName } =
      this.configService.awsSdkCredentials;

    const s3 = new S3({ accessKeyId, secretAccessKey });

    const certificationNameHash = this.cryptographicService.hash({
      data: payload.originalname + Date.now().toString(),
      algorithm: CryptoHashAlgorithm.MD5
    });

    const certificationFileName = `${certificationNameHash}.pdf`;

    const params = {
      Bucket: bucketName,
      Key: `${StaticStorages.CERTS_FILES}/${certificationFileName}`,
      Body: payload.buffer,
      ContentType: payload.mimetype
    };

    await s3.upload(params).promise();

    return new CertificationFileUploadedDto(certificationFileName);
  }

  private async uploadPicture(picture: string, folderName: string) {
    const { accessKeyId, secretAccessKey, bucketName } =
      this.configService.awsSdkCredentials;

    const s3 = new S3({ accessKeyId, secretAccessKey });

    const base64Data = Buffer.from(
      picture.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    );

    const type = picture.split(';')[0].split('/')[1];

    if (!['png', 'jpg', 'jpeg'].includes(type)) throw new WrongPictureException();

    const pictureHash = this.cryptographicService.hash({
      data: base64Data.toString() + Date.now().toString(),
      algorithm: CryptoHashAlgorithm.MD5
    });

    const pictureName = `${pictureHash}.${type}`;

    const params = {
      Bucket: bucketName,
      Key: `${folderName}/${pictureName}`,
      Body: base64Data,
      ContentEncoding: 'base64',
      ContentType: `image/${type}`
    };

    await s3.upload(params).promise();

    return pictureName;
  }

  private async deleteFile(fileName: string, folderName: string) {
    const { accessKeyId, secretAccessKey, bucketName } =
      this.configService.awsSdkCredentials;

    const s3 = new S3({ accessKeyId, secretAccessKey });

    const params = {
      Bucket: bucketName,
      Key: `${folderName}/${fileName}`
    };

    await s3.deleteObject(params).promise();
  }

  private generateUUIDv4() {
    return uuid.v4();
  }
}
