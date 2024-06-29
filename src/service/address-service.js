import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import {
  createAddressValidation,
  getAddressValidation,
  updateAddressValidation,
} from "../validation/address-validation.js";
import { getContactValidation } from "../validation/contact-validation.js";
import { validate } from "../validation/validation.js";

const checkContactMustExists = async (user, contactIdReq) => {
  const contactId = validate(getContactValidation, contactIdReq);

  const totalContactInDatabase = await prismaClient.contact.count({
    where: {
      username: user.username,
      id: contactId,
    },
  });

  if (totalContactInDatabase !== 1) {
    throw new ResponseError(404, "contact is not found");
  }

  return contactId;
};

const create = async (user, contactIdReq, request) => {
  const contactId = await checkContactMustExists(user, contactIdReq);

  const address = validate(createAddressValidation, request);
  address.contact_id = contactId;

  return prismaClient.address.create({
    data: address,
    select: {
      id: true,
      street: true,
      city: true,
      provience: true,
      country: true,
      postal_code: true,
    },
  });
};

const get = async (user, contactIdReq, addressIdReq) => {
  const contactId = await checkContactMustExists(user, contactIdReq);
  const addressId = validate(getAddressValidation, addressIdReq);

  const address = await prismaClient.address.findFirst({
    where: {
      contact_id: contactId,
      id: addressId,
    },
    select: {
      id: true,
      street: true,
      city: true,
      provience: true,
      country: true,
      postal_code: true,
    },
  });

  if (!address) {
    throw new ResponseError(404, "address is not found!");
  }

  return address;
};

const getAll = async (user, contactIdReq) => {
  const contactId = await checkContactMustExists(user, contactIdReq);

  return prismaClient.address.findMany({
    where: {
      contact_id: contactId,
    },
    select: {
      id: true,
      street: true,
      city: true,
      provience: true,
      country: true,
      postal_code: true,
    },
  });
};

const update = async (user, contactIdReq, request) => {
  const contactId = await checkContactMustExists(user, contactIdReq);
  const address = validate(updateAddressValidation, request);

  const totalAddressInDatabase = await prismaClient.address.count({
    where: {
      contact_id: contactId,
      id: address.id,
    },
  });

  if (totalAddressInDatabase !== 1) {
    throw new ResponseError(404, "address is not found!");
  }

  return prismaClient.address.update({
    where: {
      id: address.id,
    },
    data: {
      street: address.street,
      city: address.city,
      provience: address.provience,
      country: address.country,
      postal_code: address.postal_code,
    },
    select: {
      id: true,
      street: true,
      city: true,
      provience: true,
      country: true,
      postal_code: true,
    },
  });
};

const remove = async (user, contactIdReq, addressIdReq) => {
  const contactId = await checkContactMustExists(user, contactIdReq);
  const addressId = validate(getAddressValidation, addressIdReq);

  const totalAddressInDatabase = await prismaClient.address.count({
    where: {
      contact_id: contactId,
      id: addressId,
    },
  });

  if (totalAddressInDatabase !== 1) {
    throw new ResponseError(404, "address is not found!");
  }

  return prismaClient.address.delete({
    where: {
      id: addressId,
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
