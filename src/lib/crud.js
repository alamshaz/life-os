import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";

// Every route in this app is scoped to the signed-in user. This helper
// wraps that check + DB connect so individual route files stay short.
export async function withUser(handler) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  await connectDB();
  return handler(session.user);
}

// Builds { GET, POST } handlers for a "list + create" collection route.
export function collectionHandlers(Model, { defaultSort = "-createdAt", transformCreate } = {}) {
  return {
    async GET(request) {
      return withUser(async (user) => {
        const url = new URL(request.url);
        const query = { user: user.id };
        // Optional simple filters via query params, e.g. ?completed=false
        for (const [key, value] of url.searchParams.entries()) {
          if (key === "sort") continue;
          query[key] = value === "true" ? true : value === "false" ? false : value;
        }
        const sort = url.searchParams.get("sort") || defaultSort;
        const docs = await Model.find(query).sort(sort).lean();
        return NextResponse.json(docs);
      });
    },
    async POST(request) {
      return withUser(async (user) => {
        const body = await request.json();
        const payload = transformCreate ? transformCreate(body, user) : body;
        const doc = await Model.create({ ...payload, user: user.id });
        return NextResponse.json(doc, { status: 201 });
      });
    }
  };
}

// Builds { PATCH, DELETE } handlers for a single-item route ([id]).
export function itemHandlers(Model) {
  return {
    async PATCH(request, { params }) {
      return withUser(async (user) => {
        const body = await request.json();
        const doc = await Model.findOneAndUpdate(
          { _id: params.id, user: user.id },
          { $set: body },
          { new: true }
        );
        if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(doc);
      });
    },
    async DELETE(request, { params }) {
      return withUser(async (user) => {
        const doc = await Model.findOneAndDelete({ _id: params.id, user: user.id });
        if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json({ ok: true });
      });
    }
  };
}
