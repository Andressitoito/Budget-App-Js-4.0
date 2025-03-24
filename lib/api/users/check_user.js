const User = require("../../pages/api/models/usersModel");

export const check_user = async (email) => {
	let organization_owner;
	let user = await User.findOne({ email: email });

	console.log(user);

	if (user === null) {
		user = false;
		organization_owner = "none";
		return { organization_owner, user };
	}

	if (user.organization_owner == false || user.organization_owner == "none") {
		user = true;
		organization_owner = "none";
		return { organization_owner, user };
	}

	if (user.organization_owner !== "none") {
		user = true;
		organization_owner = user.organization_owner;
		return { organization_owner, user };
	}
};
