import {
  findOrganizationByInviteKey,
  updateOrganization,
} from "../../src/models/OrganizationModel";
import { acceptInvite, inviteUser } from "../../src/services/organizations";
import { Invite, OrganizationInterface } from "../../types/organization";

jest.mock("../../src/models/OrganizationModel", () => ({
  createOrganization: jest.fn(),
  findAllOrganizations: jest.fn(),
  findOrganizationById: jest.fn(),
  findOrganizationByInviteKey: jest.fn(),
  findOrganizationsByDomain: jest.fn(),
  updateOrganization: jest.fn(),
}));

jest.mock("../../src/services/email", () => ({
  isEmailEnabled: jest.fn(() => false),
  sendInviteEmail: jest.fn(),
  sendNewMemberEmail: jest.fn(),
}));

const mockedUpdateOrganization = jest.mocked(updateOrganization);
const mockedFindOrganizationByInviteKey = jest.mocked(
  findOrganizationByInviteKey
);

function makeInvite(overrides: Partial<Invite> = {}): Invite {
  return {
    email: "invited@example.com",
    key: "invite_key",
    role: "admin",
    limitAccessByEnvironment: false,
    environments: [],
    dateCreated: new Date(),
    ...overrides,
  };
}

function makeOrganization(
  overrides: Partial<OrganizationInterface> = {}
): OrganizationInterface {
  return {
    id: "org_1",
    url: "acme",
    dateCreated: new Date(),
    name: "Acme",
    ownerEmail: "owner@example.com",
    members: [],
    invites: [],
    ...overrides,
  } as OrganizationInterface;
}

function sendInvite(organization: OrganizationInterface, email: string) {
  return inviteUser({
    organization,
    email,
    role: "admin",
    limitAccessByEnvironment: false,
    environments: [],
    projectRoles: [],
  });
}

function storedInviteEmails(): string[] {
  const updates = mockedUpdateOrganization.mock.calls[0][1];
  return (updates.invites || []).map((i) => i.email);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("inviteUser email validation", () => {
  it("strips a stray trailing semicolon before storing the invite", async () => {
    await sendInvite(makeOrganization(), "gsj@brolo.me;");
    expect(storedInviteEmails()).toEqual(["gsj@brolo.me"]);
  });

  it("strips leading and trailing separators and whitespace", async () => {
    await sendInvite(makeOrganization(), " ;User@Example.com,; ");
    expect(storedInviteEmails()).toEqual(["user@example.com"]);
  });

  it("rejects a clearly malformed email", async () => {
    await expect(
      sendInvite(makeOrganization(), "not-an-email")
    ).rejects.toThrow("Invalid email address: not-an-email");
    expect(mockedUpdateOrganization).not.toHaveBeenCalled();
  });

  it("rejects multiple addresses joined by a separator", async () => {
    await expect(
      sendInvite(makeOrganization(), "a@example.com;b@example.com")
    ).rejects.toThrow("Invalid email address: a@example.com;b@example.com");
    expect(mockedUpdateOrganization).not.toHaveBeenCalled();
  });

  it("matches an existing invite after normalization", async () => {
    const organization = makeOrganization({
      invites: [makeInvite({ email: "Invited@example.com" })],
    });

    await expect(
      sendInvite(organization, " Invited@Example.com ")
    ).resolves.toMatchObject({ emailSent: true });
    expect(mockedUpdateOrganization).not.toHaveBeenCalled();
  });
});

describe("acceptInvite email verification", () => {
  it("rejects a user whose email differs from the invite", async () => {
    mockedFindOrganizationByInviteKey.mockResolvedValue(
      makeOrganization({ invites: [makeInvite()] })
    );

    await expect(
      acceptInvite("invite_key", "u_attacker", "attacker@example.com")
    ).rejects.toThrow("This invitation was sent to a different email address");
    expect(mockedUpdateOrganization).not.toHaveBeenCalled();
  });

  it("rejects when no email is provided", async () => {
    mockedFindOrganizationByInviteKey.mockResolvedValue(
      makeOrganization({ invites: [makeInvite()] })
    );

    await expect(acceptInvite("invite_key", "u_1", "")).rejects.toThrow(
      "This invitation was sent to a different email address"
    );
    expect(mockedUpdateOrganization).not.toHaveBeenCalled();
  });

  it("accepts the invited user case-insensitively", async () => {
    mockedFindOrganizationByInviteKey.mockResolvedValue(
      makeOrganization({ invites: [makeInvite()] })
    );

    await acceptInvite("invite_key", "u_1", "Invited@Example.com");

    const updates = mockedUpdateOrganization.mock.calls[0][1];
    expect(updates.invites).toEqual([]);
    expect(updates.members?.map((m) => m.id)).toEqual(["u_1"]);
  });
});
