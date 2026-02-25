import { users, listings, payments, type User, type InsertUser, type UpdateUser, type Listing, type InsertListing, type Payment, type InsertPayment, type UpdatePayment } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser & { isAdmin?: boolean }): Promise<User>;
  updateUser(id: string, user: UpdateUser): Promise<User | undefined>;
  updateUserPassword(id: string, hashedPassword: string): Promise<User | undefined>;
  setVerificationCode(id: string, code: string, expiry: Date, pendingEmail?: string): Promise<User | undefined>;
  verifyUserEmail(id: string): Promise<User | undefined>;
  clearVerificationCode(id: string): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  createListing(listing: InsertListing): Promise<Listing>;
  getListings(): Promise<Listing[]>;
  getListing(id: string): Promise<Listing | undefined>;
  updateListing(id: string, listing: Partial<InsertListing>): Promise<Listing | undefined>;
  deleteListing(id: string): Promise<boolean>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  getAllPayments(): Promise<Payment[]>;
  getPaymentById(id: string): Promise<Payment | undefined>;
  getPaymentsByUserId(userId: string): Promise<Payment[]>;
  getPaymentByListingId(listingId: string): Promise<Payment | undefined>;
  updatePayment(id: string, payment: UpdatePayment): Promise<Payment | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser & { isAdmin?: boolean }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: insertUser.email,
        username: insertUser.username,
        password: insertUser.password,
        firstName: insertUser.firstName,
        lastName: insertUser.lastName,
        isAdmin: insertUser.isAdmin ?? false,
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updateUser: UpdateUser): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        ...updateUser,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async setVerificationCode(id: string, code: string, expiry: Date, pendingEmail?: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        verificationCode: code,
        verificationCodeExpiry: expiry,
        pendingEmail: pendingEmail || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async verifyUserEmail(id: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpiry: null,
        pendingEmail: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async clearVerificationCode(id: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        verificationCode: null,
        verificationCodeExpiry: null,
        pendingEmail: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    // Also delete user's listings
    await db.delete(listings).where(eq(listings.userId, id));
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createListing(insertListing: InsertListing): Promise<Listing> {
    const [listing] = await db
      .insert(listings)
      .values(insertListing)
      .returning();
    return listing;
  }

  async getListings(): Promise<Listing[]> {
    return await db.select().from(listings);
  }

  async getListing(id: string): Promise<Listing | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    return listing || undefined;
  }

  async updateListing(id: string, updateData: Partial<InsertListing>): Promise<Listing | undefined> {
    const [listing] = await db
      .update(listings)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(listings.id, id))
      .returning();
    return listing || undefined;
  }

  async deleteListing(id: string): Promise<boolean> {
    const result = await db.delete(listings).where(eq(listings.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async getAllPayments(): Promise<Payment[]> {
    return await db.select().from(payments);
  }

  async getPaymentById(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.userId, userId));
  }

  async getPaymentByListingId(listingId: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.listingId, listingId));
    return payment || undefined;
  }

  async updatePayment(id: string, updateData: UpdatePayment): Promise<Payment | undefined> {
    const [payment] = await db
      .update(payments)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, id))
      .returning();
    return payment || undefined;
  }
}

export const storage = new DatabaseStorage();
