import React from "react";

import Typography from "./modules/components/Typography";
import PagesNavbar from "./PagesNavbar";

const InstructorYes = (props) => {
  return (
    <PagesNavbar thisPage="Cookie Policy">
      <Typography variant="h3" gutterBottom marked="center" align="center">
        Thank You for Your Interest in Our Communities!
      </Typography>
      <p>
        Please email the following message to your students whom you'd like to
        invite to apply to join our communities.
      </p>
      <p>Hello [Your class name goes here] students,</p>
      <p>
        You are invited to join and{" "}
        {props.condition === "contribute"
          ? "contribute to"
          : props.condition === "learn"
          ? "learn collaboratively at"
          : props.condition === "present"
          ? "present your research at"
          : ""}{" "}
        1Cademy {props.community} community. Several large communities of
        student researchers from different schools in the US are remotely
        collaborating through the 1Cademy platform. You can find more
        information about these communities and the application process on
        <a href="https://1cademy.us/home">our homepage</a>.
      </p>
      <p>
        [OPTIONAL: You can earn ____ points in this course by participating in
        these research communities.]
      </p>
      <p></p>
      <p>Best regards,</p>
      <p>[Your signature goes here]</p>
      <p></p>
      <p>
        Please reply to our original email if you have any questions or
        concerns.
      </p>
    </PagesNavbar>
  );
};

export default InstructorYes;