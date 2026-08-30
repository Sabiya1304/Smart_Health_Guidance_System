const User = require("../models/User");
const History = require("../models/History");

exports.getHomeData = async (req, res) => {

    try {

        const totalUsers =
            await User.countDocuments();

        const totalChecks =
            await History.countDocuments();

        const recentChecks =
            await History
                .find()
                .sort({ createdAt: -1 })
                .limit(3);

        let healthScore = 85;
        let riskLevel = "Low";
        let overallHealth = "Good";

        const highCases =
            await History.countDocuments({
                severity: "High"
            });

        if (highCases > 20) {

            healthScore = 60;
            riskLevel = "High";
            overallHealth = "Poor";

        }
        else if (highCases > 5) {

            healthScore = 75;
            riskLevel = "Medium";
            overallHealth = "Average";

        }

        res.status(200).json({

            success: true,

            stats: {
                totalUsers,
                totalChecks,
                healthScore,
                riskLevel,
                overallHealth,
                accuracy: 95
            },

            recentChecks

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};