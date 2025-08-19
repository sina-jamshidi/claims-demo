import { sql } from "@vercel/postgres";

export interface Claim {
    id: string;
    claimant_name: string;
    date: string;
    status: "New" | "In Review" | "Closed";
    summary: string;
    details: string;
    created_at: string;
}

export interface ClaimNote {
    id: string;
    claim_id: string;
    author_id: string;
    author_name: string;
    note: string;
    timestamp: string;
}

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: "admin" | "super-admin";
    created_at: string;
}

// Claims functions
export async function getClaims(): Promise<Claim[]> {
    try {
        const { rows } = await sql`
      SELECT * FROM claims 
      ORDER BY created_at DESC
    `;
        return rows as Claim[];
    } catch (error) {
        console.error("Error fetching claims:", error);
        return [];
    }
}

export async function getClaimById(id: string): Promise<Claim | null> {
    try {
        const { rows } = await sql`
      SELECT * FROM claims 
      WHERE id = ${id}
      LIMIT 1
    `;
        return (rows[0] as Claim) || null;
    } catch (error) {
        console.error("Error fetching claim:", error);
        return null;
    }
}

export async function createClaim(
    claim: Omit<Claim, "id" | "created_at">
): Promise<Claim | null> {
    try {
        const { rows } = await sql`
      INSERT INTO claims (claimant_name, date, status, summary, details)
      VALUES (${claim.claimant_name}, ${claim.date}, ${claim.status}, ${claim.summary}, ${claim.details})
      RETURNING *
    `;
        return rows[0] as Claim;
    } catch (error) {
        console.error("Error creating claim:", error);
        return null;
    }
}

export async function updateClaimStatus(
    id: string,
    status: Claim["status"]
): Promise<boolean> {
    try {
        await sql`
      UPDATE claims 
      SET status = ${status}
      WHERE id = ${id}
    `;
        return true;
    } catch (error) {
        console.error("Error updating claim status:", error);
        return false;
    }
}

// Notes functions
export async function getClaimNotes(claimId: string): Promise<ClaimNote[]> {
    try {
        const { rows } = await sql`
      SELECT cn.*, u.name as author_name
      FROM claim_notes cn
      LEFT JOIN users u ON cn.author_id::integer = u.id
      WHERE cn.claim_id = ${claimId}
      ORDER BY cn.timestamp ASC
    `;
        return rows as ClaimNote[];
    } catch (error) {
        console.error("Error fetching claim notes:", error);
        return [];
    }
}

export async function createClaimNote(
    note: Omit<ClaimNote, "id" | "timestamp" | "author_name">
): Promise<ClaimNote | null> {
    try {
        const { rows } = await sql`
      INSERT INTO claim_notes (claim_id, author_id, note)
      VALUES (${note.claim_id}, ${note.author_id}, ${note.note})
      RETURNING *
    `;

        // Get the note with author name
        const { rows: noteWithAuthor } = await sql`
      SELECT cn.*, u.name as author_name
      FROM claim_notes cn
      LEFT JOIN users u ON cn.author_id::integer = u.id
      WHERE cn.id = ${rows[0].id}
    `;

        return noteWithAuthor[0] as ClaimNote;
    } catch (error) {
        console.error("Error creating claim note:", error);
        return null;
    }
}

// Admin functions
export async function getAdmins(): Promise<AdminUser[]> {
    try {
        const { rows } = await sql`
      SELECT * FROM users 
      ORDER BY created_at DESC
    `;
        return rows as AdminUser[];
    } catch (error) {
        console.error("Error fetching admins:", error);
        return [];
    }
}

export async function createAdmin(
    admin: Omit<AdminUser, "id" | "created_at">
): Promise<AdminUser | null> {
    try {
        const { rows } = await sql`
      INSERT INTO users (name, email, role)
      VALUES (${admin.name}, ${admin.email}, ${admin.role})
      RETURNING *
    `;
        return rows[0] as AdminUser;
    } catch (error) {
        console.error("Error creating admin:", error);
        return null;
    }
}

// Initialize database tables
export async function initializeDatabase() {
    try {
        // Create users table
        await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT CHECK (role IN ('admin', 'super-admin')) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

        // Create claims table
        await sql`
      CREATE TABLE IF NOT EXISTS claims (
        id SERIAL PRIMARY KEY,
        claimant_name TEXT NOT NULL,
        date DATE NOT NULL,
        status TEXT CHECK (status IN ('New', 'In Review', 'Closed')) NOT NULL DEFAULT 'New',
        summary TEXT NOT NULL,
        details TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

        // Create claim_notes table
        await sql`
      CREATE TABLE IF NOT EXISTS claim_notes (
        id SERIAL PRIMARY KEY,
        claim_id INTEGER REFERENCES claims(id) ON DELETE CASCADE,
        author_id TEXT NOT NULL,
        note TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

        // Insert demo users if they don't exist
        await sql`
      INSERT INTO users (id, name, email, role) 
      VALUES 
        (1, 'Jane Smith', 'jane@claimbridge.com', 'super-admin'),
        (2, 'John Doe', 'john@claimbridge.com', 'admin')
      ON CONFLICT (email) DO NOTHING
    `;

        console.log("Database initialized successfully");
    } catch (error) {
        console.error("Error initializing database:", error);
    }
}
