const User = require("../../pages/api/models/usersModel");

export const find_user_by_email = async (email) => {
	const isUser = await User.findOne({ email: email });

	if (isUser !== null) {
		throw new Error("This user already exists");
	}
};
