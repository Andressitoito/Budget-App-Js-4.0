const Organization = require("../../pages/api/models/organizationModel");

export const find_duplicate_organization = async (organization) => {
	const organizations_list = await Organization.find();

	const isOrganization = organizations_list.some(
		(org) => org.organization.toLowerCase() === organization.toLowerCase()
	);
	console.log("ORGANIZATION EXISTS?: ", isOrganization);

	return isOrganization;
};
