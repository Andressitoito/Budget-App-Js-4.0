const Organization = require("../../pages/api/models/organizationModel");

export const update_organization_member = async (
	saved_user_id,
	saved_user_name,
	new_organization_id,
	isNewOrganization
) => {
	try {
		let updateData;

		if (isNewOrganization) {
			updateData = {
				$push: {
					users: {
						_id: saved_user_id,
						name: saved_user_name,
					},
				},
				$set: {
					organization_owner: saved_user_name,
				},
			};
		} else {
			updateData = {
				$push: {
					users: {
						_id: saved_user_id,
						name: saved_user_name,
					},
				},
			};
		}

		let saved_organization = await Organization.findByIdAndUpdate(
			{ _id: new_organization_id },
			updateData,
			{ runValidators: true, new: true }
		);
		console.log(saved_organization);
		return saved_organization;
	} catch (error) {
		throw new Error(`Could not update organization member`);
	}
};
