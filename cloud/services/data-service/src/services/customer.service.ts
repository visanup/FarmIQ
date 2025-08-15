// src/services/customer.service.ts
import { AppDataSource } from '../utils/dataSource';
import { Customer } from '../models/customer.model';
import { Repository } from 'typeorm';

export class CustomerService {
  private repo: Repository<Customer>;

  constructor() {
    this.repo = AppDataSource.getRepository(Customer);
  }

  /**
   * Fetch all customers.
   */
  async findAll(): Promise<Customer[]> {
    return this.repo.find();
  }

  /**
   * Fetch a single customer by ID.
   * @param id Customer ID
   */
  async findOne(id: number): Promise<Customer | null> {
    return this.repo.findOne({ where: { customer_id: id } });
  }

  /**
   * Create a new customer.
   * @param data Partial<Customer> payload
   */
  async create(data: Partial<Customer>): Promise<Customer> {
    const customer = this.repo.create(data);
    return this.repo.save(customer);
  }

  /**
   * Update an existing customer.
   * @param id Customer ID
   * @param data Partial<Customer> fields to update
   */
  async update(id: number, data: Partial<Customer>): Promise<Customer | null> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  /**
   * Delete a customer by ID.
   * @param id Customer ID
   */
  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}

