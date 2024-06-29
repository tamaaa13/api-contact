import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import {
  createContactValidation,
  getContactValidation,
  searchContactValidation,
  updateContactValidation,
} from "../validation/contact-validation.js";
import { validate } from "../validation/validation.js";

const create = async (user, request) => {
  const contact = validate(createContactValidation, request);
  contact.username = user.username;

  return await prismaClient.contact.create({
    data: contact,
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      phone: true,
    },
  });
};

const get = async (user, contactIdReq) => {
  const contactId = validate(getContactValidation, contactIdReq);

  const contact = await prismaClient.contact.findFirst({
    where: {
      username: user.username,
      id: contactId,
    },
  });

  if (!contact) {
    throw new ResponseError(404, "Contact is not found!");
  }

  return contact;
};

const getAll = async (user, requestGet) => {
  const request = validate(searchContactValidation, requestGet);

  // ((page-1)* size)
  // 1 => ((1-1) * 10) = 0
  // 2 => ((2-1) * 10) = 10

  const skip = (request.page - 1) * request.size;

  const filters = [];

  filters.push({
    username: user.username,
  });

  if (request.name) {
    filters.push({
      OR: [
        {
          first_name: {
            contains: request.name,
          },
        },
        {
          last_name: {
            contains: request.name,
          },
        },
      ],
    });
  }

  if (request.email) {
    filters.push({
      email: {
        contains: request.email,
      },
    });
  }

  if (request.phone) {
    filters.push({
      phone: {
        contains: request.phone,
      },
    });
  }

  const contact = await prismaClient.contact.findMany({
    where: {
      AND: filters,
    },
    take: request.size,
    skip: skip,
  });

  const totalItems = await prismaClient.contact.count({
    where: {
      AND: filters,
    },
  });

  return {
    data: contact,
    paging: {
      page: request.page,
      total_item: totalItems,
      total_page: Math.ceil(totalItems / request.size),
    },
  };
};

const update = async (user, request) => {
  const contact = validate(updateContactValidation, request);

  const isContactExist = await prismaClient.contact.findFirst({
    where: {
      username: user.username,
      id: contact.id,
    },
  });

  if (!isContactExist) {
    throw new ResponseError(404, "Contact is not found!");
  }

  return prismaClient.contact.update({
    where: {
      id: contact.id,
    },
    data: {
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone,
    },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      phone: true,
    },
  });
};

const remove = async (user, contactIdReq) => {
  const contactId = validate(getContactValidation, contactIdReq);

  const contact = await prismaClient.contact.findFirst({
    where: {
      username: user.username,
      id: contactId,
    },
  });

  if (!contact) {
    throw new ResponseError(404, "Contact is not found!");
  }

  return prismaClient.contact.delete({
    where: {
      id: contactId,
    },
  });
};

export default {
  create,
  get,
  getAll,
  update,
  remove,
};
