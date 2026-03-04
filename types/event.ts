import { Event, EventVendor, GlobalVendor, Payment } from "@prisma/client";

export type PopulatedEvent = Event & { payments: ({ vendor: ({ globalVendor: GlobalVendor } & EventVendor) | null } & Payment)[] };
