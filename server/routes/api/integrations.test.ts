// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'fetc... Remove this comment to see the full error message
import TestServer from "fetch-test-server";
import webService from "@server/services/web";
import {
  buildAdmin,
  buildTeam,
  buildUser,
  buildIntegration,
} from "@server/test/factories";
import { flushdb } from "@server/test/support";

const app = webService();
const server = new TestServer(app.callback());

beforeEach(() => flushdb());
afterAll(() => server.close());

describe("#integrations.update", () => {
  it("should allow updating integration events", async () => {
    const team = await buildTeam();
    const user = await buildAdmin({ teamId: team.id });
    const integration = await buildIntegration({
      userId: user.id,
      teamId: team.id,
    });

    const res = await server.post("/api/integrations.update", {
      body: {
        events: ["documents.update"],
        token: user.getJwtToken(),
        id: integration.id,
      },
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.id).toEqual(integration.id);
    expect(body.data.events.length).toEqual(1);
  });

  it("should require authorization", async () => {
    const user = await buildUser();
    const integration = await buildIntegration({
      userId: user.id,
    });
    const res = await server.post("/api/integrations.update", {
      body: {
        token: user.getJwtToken(),
        id: integration.id,
      },
    });
    expect(res.status).toEqual(403);
  });
});
