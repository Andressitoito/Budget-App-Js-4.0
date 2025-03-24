const Organization = require("../../pages/api/models/organizationModel");

export const find_organization_by_id = async (organization_id) => {
	try {
		const organization = await Organization.findOne({ _id: organization_id });

		console.log(organization);
		return organization
	} catch (error) {
		throw new Error("The provided Organization ID is incorrect or invalid");
	}
};
