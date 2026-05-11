import { db } from "./db";
import { and, desc, eq, gt, ilike, isNull, or, sql } from "drizzle-orm";
import {
  users,
  listings,
  payments,
  cebiaReports,
  dealers,
  passwordResetTokens,
  conversations,
  messages,
  quickReplies,
  type User,
  type Listing,
  type InsertListing,
  type InsertUser,
  type InsertCebiaReport,
  type UpdateCebiaReport,
  type Dealer,
  type PasswordResetToken,
  type Conversation,
  type ConversationSource,
  type ConversationStatus,
  type Message,
  type MessageSender,
  type MessageType,
  type QuickReply,
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
    const trimmed = id.trim();
    if (!trimmed) return undefined;

    // Full UUID — same as legacy /listing/[id]
    if (
      /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
        trimmed,
      )
    ) {
      const [listing] = await db
        .select()
        .from(listings)
        .where(eq(listings.id, trimmed));
      return listing || undefined;
    }

    // SEO slug segment: trailing 8 hex chars of UUID (see getListingBySlugId)
    const shortMatch = trimmed.match(/([a-f0-9]{8})$/i);
    if (!shortMatch) return undefined;
    const shortId = shortMatch[1];
    const [listing] = await db
      .select()
      .from(listings)
      .where(sql`replace(${listings.id}::text, '-', '') LIKE ${shortId + "%"}`)
      .limit(1);
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

  // Password reset tokens ---------------------------------------------------

  async invalidateUserPasswordResetTokens(userId: string): Promise<void> {
    // Mark all unused tokens for this user as consumed so a new request
    // supersedes any previous outstanding link.
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(passwordResetTokens.userId, userId),
          isNull(passwordResetTokens.usedAt),
        ),
      );
  },

  async createPasswordResetToken(args: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    requestedIpHash?: string | null;
  }): Promise<PasswordResetToken> {
    const [row] = await db
      .insert(passwordResetTokens)
      .values({
        userId: args.userId,
        tokenHash: args.tokenHash,
        expiresAt: args.expiresAt,
        requestedIpHash: args.requestedIpHash ?? null,
      })
      .returning();
    return row;
  },

  async deletePasswordResetTokenById(id: string): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, id));
  },

  async getActivePasswordResetTokenByHash(
    tokenHash: string,
  ): Promise<PasswordResetToken | undefined> {
    const now = new Date();
    const [row] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, now),
        ),
      );
    return row || undefined;
  },

  async markPasswordResetTokenUsed(id: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, id));
  },

  async setVerificationCode(
    id: string,
    code: string,
    expiry: Date,
    pendingEmail?: string,
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        verificationCode: code,
        verificationCodeExpiry: expiry,
        pendingEmail: pendingEmail ?? null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  },

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
  },

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

  // ─────────────────────────────────────────────────────────────────────────
  // Messaging — conversations, messages, quick replies
  // Used by /api/conversations/contact (public buyer form), /api/dealer/...
  // and inbound webhook routes. Schema lives in shared/schema.ts and is
  // ensured at runtime via lib/ensureMessagingSchema.ts.
  // ─────────────────────────────────────────────────────────────────────────

  /** Logged-in buyer's thread for a listing (one row per buyer × listing). */
  async findConversationByClientUserAndListing(args: {
    clientUserId: string;
    listingId: string;
  }): Promise<Conversation | undefined> {
    const [row] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.clientUserId, args.clientUserId),
          eq(conversations.listingId, args.listingId),
        ),
      )
      .orderBy(desc(conversations.updatedAt))
      .limit(1);
    return row || undefined;
  },

  async findExistingConversation(args: {
    dealerUserId: string;
    listingId: string;
    clientEmail?: string | null;
    clientPhone?: string | null;
  }): Promise<Conversation | undefined> {
    const { dealerUserId, listingId, clientEmail, clientPhone } = args;
    if (!clientEmail && !clientPhone) return undefined;

    const conditions = [
      eq(conversations.dealerUserId, dealerUserId),
      eq(conversations.listingId, listingId),
    ];
    const identityClauses = [];
    if (clientEmail) identityClauses.push(eq(conversations.clientEmail, clientEmail));
    if (clientPhone) identityClauses.push(eq(conversations.clientPhone, clientPhone));
    if (identityClauses.length === 0) return undefined;

    const [row] = await db
      .select()
      .from(conversations)
      .where(and(...conditions, or(...identityClauses)!))
      .orderBy(desc(conversations.updatedAt))
      .limit(1);
    return row;
  },

  async createConversation(args: {
    dealerUserId: string;
    dealerId: string | null;
    listingId: string;
    clientUserId?: string | null;
    clientName?: string | null;
    clientEmail?: string | null;
    clientPhone?: string | null;
    source: ConversationSource;
    threadKey?: string | null;
  }): Promise<Conversation> {
    const [row] = await db
      .insert(conversations)
      .values({
        dealerUserId: args.dealerUserId,
        dealerId: args.dealerId,
        listingId: args.listingId,
        clientUserId: args.clientUserId ?? null,
        clientName: args.clientName ?? null,
        clientEmail: args.clientEmail ?? null,
        clientPhone: args.clientPhone ?? null,
        source: args.source,
        status: "new",
        threadKey: args.threadKey ?? null,
      })
      .returning();
    return row;
  },

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [row] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return row || undefined;
  },

  async getConversationByThreadKey(
    threadKey: string,
  ): Promise<Conversation | undefined> {
    const [row] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.threadKey, threadKey));
    return row || undefined;
  },

  async listConversationsForDealer(args: {
    dealerUserId: string;
    status?: ConversationStatus;
    search?: string;
  }): Promise<Conversation[]> {
    const conds = [eq(conversations.dealerUserId, args.dealerUserId)];
    if (args.status) conds.push(eq(conversations.status, args.status));
    if (args.search && args.search.trim().length > 0) {
      const like = `%${args.search.trim()}%`;
      const searchClause = or(
        ilike(conversations.clientName, like),
        ilike(conversations.clientEmail, like),
        ilike(conversations.clientPhone, like),
        ilike(conversations.lastMessagePreview, like),
      );
      if (searchClause) conds.push(searchClause);
    }
    return await db
      .select()
      .from(conversations)
      .where(and(...conds))
      .orderBy(desc(conversations.lastMessageAt), desc(conversations.updatedAt))
      .limit(200);
  },

  async listMessages(conversationId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  },

  async createMessage(args: {
    conversationId: string;
    sender: MessageSender;
    type?: MessageType;
    content: string;
    channel?: ConversationSource;
    externalId?: string | null;
    read?: boolean;
  }): Promise<Message> {
    const [row] = await db
      .insert(messages)
      .values({
        conversationId: args.conversationId,
        sender: args.sender,
        type: args.type ?? "text",
        content: args.content,
        channel: args.channel ?? "chat",
        externalId: args.externalId ?? null,
        read: args.read ?? false,
      })
      .returning();
    return row;
  },

  /**
   * Update conversation aggregates after a new message:
   * - bump updatedAt
   * - set lastMessageAt / lastMessagePreview
   * - bump dealer-side unread counter when sender=client
   * - move status from "new" → "in_progress" once dealer or client sends
   *   the second-or-later message (matches the spec).
   */
  async touchConversationAfterMessage(args: {
    conversationId: string;
    sender: MessageSender;
    contentPreview: string;
    bumpStatusToInProgress: boolean;
  }): Promise<void> {
    const setData: Record<string, unknown> = {
      updatedAt: new Date(),
      lastMessageAt: new Date(),
      lastMessagePreview: args.contentPreview.slice(0, 280),
    };
    if (args.bumpStatusToInProgress) {
      setData.status = "in_progress";
    }
    await db
      .update(conversations)
      .set(setData)
      .where(eq(conversations.id, args.conversationId));

    if (args.sender === "client") {
      await db
        .update(conversations)
        .set({ unreadDealerCount: sql`${conversations.unreadDealerCount} + 1` })
        .where(eq(conversations.id, args.conversationId));
    }
  },

  async markConversationReadByDealer(conversationId: string): Promise<void> {
    await db
      .update(conversations)
      .set({ unreadDealerCount: 0, updatedAt: new Date() })
      .where(eq(conversations.id, conversationId));
    await db
      .update(messages)
      .set({ read: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.sender, "client"),
          eq(messages.read, false),
        ),
      );
  },

  async updateConversationStatus(
    conversationId: string,
    status: ConversationStatus,
  ): Promise<Conversation | undefined> {
    const [row] = await db
      .update(conversations)
      .set({ status, updatedAt: new Date() })
      .where(eq(conversations.id, conversationId))
      .returning();
    return row || undefined;
  },

  async getDealerUnreadCount(dealerUserId: string): Promise<number> {
    const result = (await db.execute(sql`
      SELECT COALESCE(SUM(unread_dealer_count), 0)::int AS total
      FROM conversations
      WHERE dealer_user_id = ${dealerUserId}
    `)) as { rows?: Array<{ total: number }> };
    return result?.rows?.[0]?.total ?? 0;
  },

  // Quick replies ----------------------------------------------------------

  async listQuickReplies(dealerUserId: string): Promise<QuickReply[]> {
    return await db
      .select()
      .from(quickReplies)
      .where(eq(quickReplies.dealerUserId, dealerUserId))
      .orderBy(quickReplies.sortOrder, quickReplies.createdAt);
  },

  async createQuickReply(args: {
    dealerUserId: string;
    title: string;
    message: string;
    sortOrder?: number;
  }): Promise<QuickReply> {
    const [row] = await db
      .insert(quickReplies)
      .values({
        dealerUserId: args.dealerUserId,
        title: args.title,
        message: args.message,
        sortOrder: args.sortOrder ?? 0,
      })
      .returning();
    return row;
  },

  async updateQuickReply(args: {
    id: string;
    dealerUserId: string;
    title?: string;
    message?: string;
    sortOrder?: number;
  }): Promise<QuickReply | undefined> {
    const setData: Record<string, unknown> = { updatedAt: new Date() };
    if (args.title !== undefined) setData.title = args.title;
    if (args.message !== undefined) setData.message = args.message;
    if (args.sortOrder !== undefined) setData.sortOrder = args.sortOrder;
    const [row] = await db
      .update(quickReplies)
      .set(setData)
      .where(
        and(
          eq(quickReplies.id, args.id),
          eq(quickReplies.dealerUserId, args.dealerUserId),
        ),
      )
      .returning();
    return row || undefined;
  },

  async deleteQuickReply(args: {
    id: string;
    dealerUserId: string;
  }): Promise<boolean> {
    const rows = await db
      .delete(quickReplies)
      .where(
        and(
          eq(quickReplies.id, args.id),
          eq(quickReplies.dealerUserId, args.dealerUserId),
        ),
      )
      .returning({ id: quickReplies.id });
    return rows.length > 0;
  },
};
