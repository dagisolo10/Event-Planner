import { EventVendor, GlobalVendor, Payment } from "@prisma/client";

export type PopulatedEventVendor = EventVendor & {
    globalVendor: GlobalVendor;
    payments?: Payment[];
};
