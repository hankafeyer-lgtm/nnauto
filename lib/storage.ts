import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  users,
  listings,
  payments,
  cebiaReports,
  dealers,
  type User,
  type Listing,
  type InsertListing,
  type InsertUser,
  type InsertCebiaReport,
  type UpdateCebiaReport,
  type Dealer,
} from "@shared/schema";

export const storage = {
  async getUser(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  },

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  },

  async getUserByUsername(username: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || undefined;
  },

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  },

  async updateUser(
    id: string,
    updateData: Partial<InsertUser>,
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  },

  async deleteUser(id: string): Promise<boolean> {
    await db.delete(listings).where(eq(listings.userId, id));
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  },

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  },

  async createListing(insertListing: InsertListing): Promise<Listing> {
    const [listing] = await db
      .insert(listings)
      .values(insertListing)
      .returning();
    return listing;
  },

  async getListings(): Promise<Listing[]> {
    return await db.select().from(listings);
  },

  async getListing(id: string): Promise<Listing | undefined> {
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, id));
    return listing || undefined;
  },

  async updateListing(
    id: string,
    updateData: Partial<InsertListing>,
  ): Promise<Listing | undefined> {
    const [listing] = await db
      .update(listings)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(listings.id, id))
      .returning();
    return listing || undefined;
  },

  async deleteListing(id: string): Promise<boolean> {
    const result = await db
      .delete(listings)
      .where(eq(listings.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  },

  async createPayment(insertPayment: any) {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  },

  async getAllPayments() {
    return await db.select().from(payments);
  },

  async getPayment(id: string) {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id));
    return payment || undefined;
  },

  async updateUserPassword(
    id: string,
    hashedPassword: string,
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  },

  async getAllCebiaReports() {
    return await db.select().from(cebiaReports);
  },

  async getCebiaReportById(id: string) {
    const [report] = await db
      .select()
      .from(cebiaReports)
      .where(eq(cebiaReports.id, id));
    return report || undefined;
  },

  async createCebiaReport(data: InsertCebiaReport) {
    const [report] = await db.insert(cebiaReports).values(data).returning();
    return report;
  },

  async updateCebiaReport(id: string, data: UpdateCebiaReport) {
    const [report] = await db
      .update(cebiaReports)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(cebiaReports.id, id))
      .returning();
    return report || undefined;
  },

  async getCebiaReportsByUserId(userId: string) {
    return await db
      .select()
      .from(cebiaReports)
      .where(eq(cebiaReports.userId, userId));
  },

  async getCebiaReportByStripeSessionId(sessionId: string) {
    const [report] = await db
      .select()
      .from(cebiaReports)
      .where(eq(cebiaReports.stripeSessionId, sessionId));
    return report || undefined;
  },

  async getAllDealers(): Promise<Dealer[]> {
    return await db.select().from(dealers);
  },

  async updateDealer(
    id: string,
    data: Partial<{
      companyName: string;
      isVerified: boolean;
      maxListings: number;
      phone: string | null;
      email: string | null;
    }>,
  ): Promise<Dealer | undefined> {
    const [row] = await db
      .update(dealers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(dealers.id, id))
      .returning();
    return row;
  },
};
