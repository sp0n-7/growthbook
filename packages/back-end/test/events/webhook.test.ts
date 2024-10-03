import { setupApp } from "../api/api.setup";
import { EventNotifier } from "../../src/events/notifiers/EventNotifier";
import {
  EventWebHookModel,
  sendEventWebhookTestEvent,
} from "../../src/models/EventWebhookModel";
import { EventModel } from "../../src/models/EventModel";

jest.mock("../../src/models/EventWebhookModel", () => ({
  ...jest.requireActual("../../src/models/EventWebhookModel"),
  getEventWebHookById: jest.fn(),
}));

jest.mock("../../src/events/notifiers/EventNotifier", () => ({
  EventNotifier: jest.fn(),
}));

describe("webhook test events", () => {
  setupApp();

  const org = { id: "org", environments: [{ id: "production" }] };

  it("dispatches webhook test events", async () => {
    jest
      .spyOn(EventWebHookModel, "findOne")
      .mockReturnValue({ toJSON: () => ({ id: "webhook-aabb" }) });

    const mockNotifier = { perform: jest.fn() };
    EventNotifier.mockReturnValue(mockNotifier);

    const eventModelCreate = jest.spyOn(EventModel, "create");

    await sendEventWebhookTestEvent(
      {
        permissions: { canCreateEventWebhook: () => true },
        org,
      },
      "webhook-aabb"
    );

    expect(eventModelCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          api_version: expect.any(String),
          containsSecrets: false,
          created: expect.any(Number),
          data: { object: { webhookId: "webhook-aabb" } },
          environments: [],
          event: "webhook.test",
          object: "webhook",
          projects: [],
          tags: [],
          user: null,
        },
        dateCreated: expect.any(Date),
        event: "webhook.test",
        id: expect.any(String),
        object: "webhook",
        objectId: "webhook-aabb",
        organizationId: "org",
        version: 1,
      })
    );
    expect(EventNotifier).toHaveBeenCalledWith(
      eventModelCreate.mock.calls[0][0].id
    );
    expect(mockNotifier.perform).toHaveBeenCalled();
  });
});