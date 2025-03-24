const Organization = require("../../pages/api/models/organizationModel");

export const check_organization_ownership = async (
	organization_id,
	organization_owner
) => {
	let organization_data = await Organization.findOne({
		_id: organization_id,
	});

	if (organization_data.organization === organization_owner) {
		throw new Error(
			`Sorry, you cannot join an organization you already own. Please log in to your existing organization account to continue.`
		);
	}
};
