import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import LinkIcon from "@mui/icons-material/Link";
import EmailIcon from "@mui/icons-material/Email";

import { firebaseOnecademyState } from "../../store/OneCademyAtoms";

import Typography from "./modules/components/Typography";
import AppAppBar from "./modules/views/AppAppBar";
import AppFooter from "./modules/views/AppFooter";
import withRoot from "./modules/withRoot";
import Button from "./modules/components/Button";
import YoutubeEmbed from "./modules/components/YoutubeEmbed/YoutubeEmbed";

import JoinUs from "./modules/views/JoinUs";

import allCommunities from "./modules/views/communitiesOrder";
import sectionsOrder from "./modules/views/sectionsOrder";

const switchSection = (newValue) => (event) => {
  window.location.replace("/Home#" + sectionsOrder[newValue + 1].id);
};

const homeClick = (event) => {
  window.location.replace("/Home");
};

const joinUsClick = (event) => {
  window.location.replace("/Home#JoinUsSection");
};

const accumulatePoints = (groups, reputationData, user, points) => {
  for (let communi of groups) {
    for (let deTag of communi.tags) {
      if (reputationData.tag === deTag.title) {
        const userIdx = communi.allTime.findIndex(
          (obj) => obj.uname === reputationData.uname
        );
        if (userIdx !== -1) {
          communi.allTime[userIdx].points += points;
        } else {
          communi.allTime.push({
            uname: reputationData.uname,
            ...user,
            points,
          });
        }
      }
    }
  }
};

const Communities = (props) => {
  const firebase = useRecoilValue(firebaseOnecademyState);

  const [reputationsChanges, setReputationsChanges] = useState([]);
  const [reputations, setReputations] = useState({});
  const [reputationsLoaded, setReputationsLoaded] = useState(false);
  const [usersChanges, setUsersChanges] = useState([]);
  const [users, setUsers] = useState({});
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [expanded, setExpanded] = useState(props.commId);
  const [communities, setCommunities] = useState(allCommunities);

  useEffect(() => {
    if (props.commId) {
      setCommunities((oldCommunities) => {
        let newCommunities = [...oldCommunities];
        const commIdx = newCommunities.findIndex(
          (communi) => communi.id === props.commId
        );
        const theCommunity = newCommunities.splice(commIdx, 1);
        newCommunities = [...theCommunity, ...newCommunities];
        return newCommunities;
      });
    }
  }, [props.commId]);

  useEffect(() => {
    if (firebase) {
      const usersQuery = firebase.db.collection("users");
      const usersSnapshot = usersQuery.onSnapshot((snapshot) => {
        const docChanges = snapshot.docChanges();
        setUsersChanges((oldUsersChanges) => {
          return [...oldUsersChanges, ...docChanges];
        });
      });
      return () => {
        setUsersChanges([]);
        usersSnapshot();
      };
    }
  }, [firebase]);

  useEffect(() => {
    if (usersChanges.length > 0) {
      let members = { ...users };
      for (let change of usersChanges) {
        const userData = change.doc.data();
        if (change.type === "removed" || userData.deleted) {
          if (change.doc.id in members) {
            delete members[change.doc.id];
          }
        } else {
          members[change.doc.id] = {
            uname: userData.uname,
            fullname: userData.fName + " " + userData.lName,
            imageUrl: userData.imageUrl,
          };
        }
      }
      setUsersChanges([]);
      setUsers(members);
      setUsersLoaded(true);
    }
  }, [usersChanges, users]);

  useEffect(() => {
    if (firebase && usersLoaded) {
      const reputationsQuery = firebase.db.collection("reputations");
      const reputationsSnapshot = reputationsQuery.onSnapshot((snapshot) => {
        const docChanges = snapshot.docChanges();
        setReputationsChanges((oldReputationsChanges) => {
          return [...oldReputationsChanges, ...docChanges];
        });
      });
      return () => {
        setReputationsChanges([]);
        reputationsSnapshot();
      };
    }
  }, [firebase, usersLoaded]);

  useEffect(() => {
    if (reputationsChanges.length > 0) {
      let rpts = { ...reputations };
      const groups = [...communities];
      for (let change of reputationsChanges) {
        const reputationData = change.doc.data();
        const points =
          reputationData.dCorrects +
          reputationData.iCorrects +
          reputationData.mCorrects -
          reputationData.dWrongs -
          reputationData.iWrongs -
          reputationData.mWrongs;
        if (change.type === "removed" || reputationData.deleted) {
          if (reputationData.uname in rpts) {
            delete rpts[reputationData.uname];
          }
        } else {
          const user = users[reputationData.uname];
          if (!(reputationData.uname in rpts)) {
            accumulatePoints(groups, reputationData, user, points);
            rpts[reputationData.uname] = { [reputationData.tag]: points };
          } else {
            if (!(reputationData.tag in rpts[reputationData.uname])) {
              accumulatePoints(groups, reputationData, user, points);
              rpts[reputationData.uname][reputationData.tag] = points;
            } else {
              accumulatePoints(
                groups,
                reputationData,
                user,
                points - rpts[reputationData.uname][reputationData.tag]
              );
              rpts[reputationData.uname][reputationData.tag] = points;
            }
          }
        }
      }
      for (let communi of groups) {
        communi.allTime.sort((a, b) => b.points - a.points);
      }
      setReputationsChanges([]);
      setReputations(rpts);
      setCommunities(groups);
      setReputationsLoaded(true);
    }
  }, [reputationsChanges, reputations, communities]);

  const handleChange = (commId) => (event, newExpanded) => {
    const idx = communities.findIndex((communi) => communi.id === commId);
    if (idx !== -1) {
      window.history.replaceState(
        null,
        communities[idx].title,
        "/community/" + commId
      );
    }
    setExpanded(newExpanded ? commId : false);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        overflowY: "auto",
        overflowX: "auto",
      }}
    >
      <AppAppBar
        switchSection={switchSection}
        homeClick={homeClick}
        joinUsClick={joinUsClick}
      />
      <Box
        sx={{
          margin: { xs: 0, sm: "4px", md: "10px", lg: "16px", xl: "25px" },
        }}
      >
        <Typography variant="h3" gutterBottom marked="center" align="center">
          1Cademy Communities
        </Typography>
        {communities.map((communi, idx) => (
          <Accordion
            key={communi.id}
            expanded={expanded === communi.id}
            onChange={handleChange(communi.id)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography
                variant="h5"
                gutterBottom
                align="center"
                sx={{ fontWeight: "700" }}
              >
                {communi.title + " Community"}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={{ xs: 1, md: 2.2 }}>
                <Grid item xs={12} lg={6} xl={4}>
                  <Paper sx={{ padding: "10px", mb: "19px" }}>
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{
                        pt: "19px",
                        pb: "19px",
                      }}
                    >
                      Community Introduction
                    </Typography>
                    <YoutubeEmbed embedId={communi.YouTube} />
                  </Paper>
                </Grid>
                <Grid item xs={12} lg={6} xl={4}>
                  <Paper sx={{ padding: "10px", mb: "19px" }}>
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{
                        pt: "19px",
                        pb: "19px",
                      }}
                    >
                      Community Description
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: "left" }}
                    >
                      {communi.description}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} lg={6} xl={4}>
                  <Paper sx={{ padding: "10px", mb: "19px" }}>
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{
                        pt: "19px",
                        pb: "19px",
                      }}
                    >
                      Community Accomplishments
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: "left" }}
                    >
                      {communi.accomplishments}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} lg={6} xl={4}>
                  <Paper sx={{ padding: "10px", mb: "19px" }}>
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{
                        pt: "19px",
                        pb: "19px",
                      }}
                    >
                      By Joining Us, You Will ...
                    </Typography>
                    <ul>
                      {communi.gains &&
                        communi.gains.map((gain) => {
                          return <li>{gain}</li>;
                        })}
                    </ul>
                  </Paper>
                </Grid>
                <Grid item xs={12} lg={6} xl={4}>
                  <Paper sx={{ padding: "10px", mb: "19px" }}>
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{
                        pt: "19px",
                        pb: "19px",
                      }}
                    >
                      Community Requirements
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: "left" }}
                    >
                      {communi.requirements}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} lg={6} xl={4}>
                  <Paper sx={{ padding: "10px", mb: "19px" }}>
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{
                        pt: "19px",
                        pb: "19px",
                      }}
                    >
                      Qualifications
                    </Typography>
                    <ul>
                      {communi.qualifications &&
                        communi.qualifications.map((qualifi) => {
                          return <li>{qualifi}</li>;
                        })}
                    </ul>
                  </Paper>
                </Grid>
                <Grid item xs={12} lg={6} xl={4}>
                  <Paper sx={{ padding: "10px", mb: "19px" }}>
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{
                        pt: "19px",
                        pb: "19px",
                      }}
                    >
                      Responsibilities
                    </Typography>
                    <ul>
                      {communi.responsibilities &&
                        communi.responsibilities.map((responsibility) => {
                          return <li>{responsibility}</li>;
                        })}
                    </ul>
                  </Paper>
                </Grid>
                <Grid item xs={12} lg={6} xl={4}>
                  <Paper sx={{ padding: "10px", mb: "19px" }}>
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{
                        pt: "19px",
                        pb: "19px",
                      }}
                    >
                      Community Members
                    </Typography>
                    <Paper
                      sx={{
                        m: "2.5px",
                        minHeight: "130px",
                      }}
                    >
                      <Typography
                        variant="h5"
                        component="div"
                        sx={{
                          display: "block",
                          padding: "19px 0px 0px 19px",
                          fontStyle: "italic",
                        }}
                      >
                        Community Leaders
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "left",
                          flexWrap: "wrap",
                          listStyle: "none",
                          p: 0.5,
                          m: 0,
                        }}
                        component="ul"
                      >
                        {communi.leaders &&
                          communi.leaders.map((leader, idx) => {
                            return (
                              <li key={leader.name}>
                                <Chip
                                  sx={{
                                    height: "109px",
                                    margin: "10px",
                                    borderRadius: "58px",
                                  }}
                                  icon={
                                    <Avatar
                                      src={
                                        "/static/CommunityLeaders/" +
                                        leader.image
                                      }
                                      alt={leader.name}
                                      sx={{
                                        width: "100px",
                                        height: "100px",
                                        mr: 2.5,
                                      }}
                                    />
                                  }
                                  variant="outlined"
                                  label={
                                    <>
                                      <Typography variant="h5" component="div">
                                        {leader.name}
                                      </Typography>
                                      {leader.websites &&
                                        leader.websites.map((wSite) => {
                                          return (
                                            <IconButton
                                              component="a"
                                              href={wSite.url}
                                              target="_blank"
                                              aria-label={wSite.name}
                                            >
                                              {wSite.name === "LinkedIn" ? (
                                                <LinkedInIcon />
                                              ) : (
                                                <LinkIcon />
                                              )}
                                            </IconButton>
                                          );
                                        })}
                                      <IconButton
                                        component="a"
                                        href={
                                          "mailto:onecademy@umich.edu?subject=" +
                                          communi.title +
                                          " Question for " +
                                          leader.name
                                        }
                                        target="_blank"
                                        aria-label="email"
                                      >
                                        <EmailIcon />
                                      </IconButton>
                                    </>
                                  }
                                />
                              </li>
                            );
                          })}
                      </Box>
                    </Paper>
                    <Paper
                      sx={{
                        m: "2.5px",
                        minHeight: "130px",
                      }}
                    >
                      <Typography
                        variant="h5"
                        component="div"
                        sx={{
                          display: "block",
                          padding: "19px 0px 0px 19px",
                          fontStyle: "italic",
                        }}
                      >
                        Leaderboard (Only those with &gt; 25 points)
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "left",
                          flexWrap: "wrap",
                          listStyle: "none",
                          p: 0.5,
                          m: 0,
                        }}
                        component="ul"
                      >
                        {communi.allTime &&
                          communi.allTime.map((member, idx) => {
                            return member.points >= 25 ? (
                              <li key={member.uname}>
                                <Chip
                                  sx={{
                                    height: "49px",
                                    margin: "4px",
                                    borderRadius: "28px",
                                  }}
                                  icon={
                                    <Avatar
                                      src={member.imageUrl}
                                      alt={member.fullname}
                                      sx={{
                                        width: "40px",
                                        height: "40px",
                                        mr: 2.5,
                                      }}
                                    />
                                  }
                                  variant="outlined"
                                  label={
                                    <>
                                      <Typography
                                        variant="body2"
                                        component="div"
                                      >
                                        {member.fullname}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        component="div"
                                      >
                                        {idx < 3 ? "🏆" : "✔️"}
                                        {" " +
                                          Math.round(
                                            (member.points + Number.EPSILON) *
                                              100
                                          ) /
                                            100}
                                      </Typography>
                                    </>
                                  }
                                />
                              </li>
                            ) : null;
                          })}
                      </Box>
                    </Paper>
                    {/* <Grid
                      container
                      spacing={2.5}
                      align="center"
                      justify="center"
                      alignItems="center"
                    >
                      {communi.leaders &&
                        communi.leaders.map((leader, idx) => {
                          return (
                            <Grid key={leader.name} xs={12}>
                              <List
                                sx={{
                                  width: "100%",
                                  bgcolor: "background.paper",
                                }}
                              >
                                <ListItem>
                                  <ListItemAvatar>
                                    <Avatar
                                      src={
                                        "/static/CommunityLeaders/" +
                                        leader.image
                                      }
                                      alt={leader.name}
                                      sx={{ width: 100, height: 100, mr: 2.5 }}
                                    />
                                    {leader.websites &&
                                      leader.websites.map((wSite) => {
                                        return (
                                          <IconButton
                                            component="a"
                                            href={wSite.url}
                                            aria-label={wSite.name}
                                          >
                                            {wSite.name === "LinkedIn" ? (
                                              <LinkedInIcon />
                                            ) : (
                                              <LinkIcon />
                                            )}
                                          </IconButton>
                                        );
                                      })}
                                    <IconButton
                                      component="a"
                                      href={
                                        "mailto:onecademy@umich.edu?subject=" +
                                        communi.title +
                                        " Question for " +
                                        leader.name
                                      }
                                      aria-label="email"
                                    >
                                      <EmailIcon />
                                    </IconButton>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={leader.name}
                                    secondary={
                                      <React.Fragment>
                                        <Typography
                                          sx={{ display: "inline" }}
                                          component="span"
                                          variant="body2"
                                          color="text.primary"
                                        >
                                          {leader.about}
                                        </Typography>
                                      </React.Fragment>
                                    }
                                  />
                                </ListItem>
                                <Divider variant="inset" component="li" />
                              </List>
                            </Grid>
                          );
                        })}
                    </Grid> */}
                  </Paper>
                </Grid>
                <Grid item xs={12} lg={6} xl={4}>
                  <Paper sx={{ padding: "10px", mb: "19px" }}>
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{
                        pt: "19px",
                        pb: "0px",
                      }}
                    >
                      Apply to Join this Community
                    </Typography>
                    <JoinUs community={communi} />
                  </Paper>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      <AppFooter />
    </Box>
  );
};

export default withRoot(Communities);
