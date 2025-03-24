const Organization = require("../../pages/api/models/organizationModel");

export const create_and_save_organization = async (organization) => {
	let new_organization;
	let saved_organization;
	let new_organization_id;
	try {
		new_organization = await new Organization({
			organization: organization,
		});
		saved_organization = await new_organization.save();
		new_organization_id = saved_organization.id;
		return {
			saved_organization,
			new_organization_id,
		};
	} catch (error) {
		throw new Error(
			`There was a problem creating and saving new organization: ${organization}`
		);
	}
};
