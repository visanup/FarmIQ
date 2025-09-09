import { prisma } from '../lib/prisma';
import {
  CreateContactInput,
  UpdateContactInput,
  ContactResponse,
  PaginationQuery,
} from '../schemas/customer.schemas';

export class ContactService {
  async createContact(data: CreateContactInput): Promise<ContactResponse> {
    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // If this is a primary contact, unset other primary contacts of the same type
    if (data.isPrimary) {
      await prisma.contact.updateMany({
        where: {
          customerId: data.customerId,
          type: data.type,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });
    }

    // Create contact
    const contact = await prisma.contact.create({
      data,
    });

    return this.formatContactResponse(contact);
  }

  async getContacts(
    pagination: PaginationQuery,
    customerId?: string
  ): Promise<{ contacts: ContactResponse[]; total: number; page: number; limit: number }> {
    const { page, limit, search } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      ...(customerId && { customerId }),
      ...(search && {
        OR: [
          { value: { contains: search, mode: 'insensitive' as const } },
          { customer: { name: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
    };

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contact.count({ where }),
    ]);

    return {
      contacts: contacts.map(this.formatContactResponse),
      total,
      page,
      limit,
    };
  }

  async getContactById(id: string): Promise<ContactResponse | null> {
    const contact = await prisma.contact.findUnique({
      where: { id },
    });

    return contact ? this.formatContactResponse(contact) : null;
  }

  async updateContact(id: string, data: UpdateContactInput): Promise<ContactResponse> {
    // Check if contact exists
    const existingContact = await prisma.contact.findUnique({
      where: { id },
    });

    if (!existingContact) {
      throw new Error('Contact not found');
    }

    // If this is being set as primary, unset other primary contacts of the same type
    if (data.isPrimary) {
      await prisma.contact.updateMany({
        where: {
          customerId: existingContact.customerId,
          type: data.type || existingContact.type,
          isPrimary: true,
          id: { not: id },
        },
        data: { isPrimary: false },
      });
    }

    // Update contact
    const contact = await prisma.contact.update({
      where: { id },
      data,
    });

    return this.formatContactResponse(contact);
  }

  async deleteContact(id: string): Promise<void> {
    // Check if contact exists
    const contact = await prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    // Delete contact
    await prisma.contact.delete({
      where: { id },
    });
  }

  private formatContactResponse(contact: any): ContactResponse {
    return {
      id: contact.id,
      customerId: contact.customerId,
      type: contact.type,
      value: contact.value,
      isPrimary: contact.isPrimary,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    };
  }
}