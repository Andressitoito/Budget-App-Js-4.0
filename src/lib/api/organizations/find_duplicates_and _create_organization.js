import { find_duplicate_organization } from "./find_duplicate_organization";
import { create_and_save_organization } from "./create_and_save_organization";

export const find_duplicates_and_create_organization = async (organization) => {
	try {
		////////////////////////////////
		// FIND DUPLICATES ORGANIZATIONS
		////////////////////////////////
		const isOrganization = await find_duplicate_organization(organization);
		if (isOrganization) {
			throw new Error(`The organization ${organization} already exists`);
		}
		////////////////////////////////
		// CREATE	NEW ORGANIZATION
		////////////////////////////////
		let new_organization = await create_and_save_organization(organization);

		return new_organization;
	} catch (error) {
		throw new Error(error);
	}
};
