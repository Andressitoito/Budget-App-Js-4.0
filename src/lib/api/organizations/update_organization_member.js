import Organization from '../../../models/organizationModel';

export const update_organization_member = async (user_id, organization_id) => {
  try {
    const saved_organization = await Organization.findByIdAndUpdate(
      organization_id,
      {
        $push: {
          users: {
            user: user_id,
            role: 'member',
          },
        },
      },
      { runValidators: true, new: true }
    );

    if (!saved_organization) {
      throw new Error('Organization not found');
    }

    console.log('Updated organization:', saved_organization);
    return saved_organization;
  } catch (error) {
    throw new Error(`Could not update organization member: ${error.message}`);
  }
};