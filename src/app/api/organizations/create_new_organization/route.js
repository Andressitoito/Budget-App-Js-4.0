import dbConnect from '../../../lib/db';
import Organization from '../../../models/organizationModel';
import User from '../../../models/usersModel';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { organization: orgName, user: userInfo } = req.body;

    if (!orgName || !userInfo) {
      return res.status(400).json({
        status: 400,
        message: 'Organization name and user information are required'
      });
    }

    // Connect to the database
    await dbConnect();

    // Check if organization name already exists
    const existingOrg = await Organization.findOne({ organization: orgName.trim() });
    if (existingOrg) {
      return res.status(409).json({
        status: 409,
        message: 'An organization with this name already exists'
      });
    }

    // Find or create user
    let user = await User.findOne({ email: userInfo.email });
    
    if (user) {
      // Check if user already owns an organization
      const userOrgs = await Organization.find({
        'users': {
          $elemMatch: {
            user: user._id,
            role: 'owner'
          }
        }
      });

      if (userOrgs.length > 0) {
        return res.status(403).json({
          status: 403,
          message: `Sorry ${user.name}, but you already own an organization. Please join an existing organization instead.`,
          redirect_join_organization: true
        });
      }
    } else {
      // Create new user
      user = new User({
        name: userInfo.name,
        given_name: userInfo.given_name,
        family_name: userInfo.family_name,
        email: userInfo.email,
        picture: userInfo.picture
      });
      await user.save();
    }

    // Create new organization
    const newOrg = new Organization({
      organization: orgName.trim(),
      main_budget: 0, // Default budget, can be updated later
      organization_owner: user._id,
      users: [{
        user: user._id,
        role: 'owner'
      }]
    });

    const savedOrg = await newOrg.save();

    // Update user's primary organization
    user.primary_organization = {
      organization: savedOrg._id,
      role: 'owner'
    };
    
    if (!user.organizations) {
      user.organizations = [];
    }
    user.organizations.push({
      organization: savedOrg._id,
      role: 'owner'
    });

    await user.save();

    return res.status(201).json({
      status: 201,
      message: `Organization ${orgName} has been successfully created with ${user.name} as owner`,
      data: {
        organization: savedOrg,
        user: user
      }
    });

  } catch (error) {
    console.error('Error creating organization:', error);
    return res.status(500).json({
      status: 500,
      message: 'Error creating organization',
      error: error.message
    });
  }
}
