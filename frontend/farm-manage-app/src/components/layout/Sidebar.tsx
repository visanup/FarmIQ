// frontend\farm-manage-app\src\components\layout\Sidebar.tsx
import React from "react";
import {
  List,
  ListSubheader,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useMediaQuery,
  Box,
} from "@mui/material";
import { styled, CSSObject, Theme } from "@mui/material/styles";

import HomeIcon from "@mui/icons-material/Home";
import HouseIcon from "@mui/icons-material/House";
import PetsIcon from "@mui/icons-material/Pets";
import ScienceIcon from "@mui/icons-material/Science";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SpeedIcon from "@mui/icons-material/Speed";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import NatureIcon from "@mui/icons-material/Nature";
import ApartmentIcon from "@mui/icons-material/Apartment";
import WaterIcon from "@mui/icons-material/Water";
import BuildIcon from "@mui/icons-material/Build";

import { NavLink, useLocation } from "react-router-dom";

const drawerWidth = 260;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  overflowX: "hidden",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[4],
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  height: "100vh",
  position: "relative",
});

const closedMixin = (theme: Theme): CSSObject => ({
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[1],
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  height: "100vh",
  position: "relative",
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const StyledSidebar = styled("nav", {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open: boolean }>(({ theme, open }) => ({
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  flexShrink: 0,
  ...(open
    ? {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      }
    : {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      }),
}));

const ListItemButtonStyled = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 1),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  transition: theme.transitions.create(["background-color", "color"], {
    duration: theme.transitions.duration.shortest,
  }),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.primary.main,
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.main,
    },
  },
  "&.active": {
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightMedium,
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.main,
    },
  },
  "&.active:hover": {
    backgroundColor: theme.palette.action.selected,
  },
}));

const farmMenu = [
  {
    group: "Farm Management",
    items: [
      { text: "Farms", path: "/farms", icon: <HomeIcon /> },
      { text: "Houses", path: "/houses", icon: <HouseIcon /> },
      { text: "Animals", path: "/animals", icon: <PetsIcon /> },
    ],
  },
  {
    group: "Genetics & Health",
    items: [
      { text: "Genetic Factors", path: "/genetic-factors", icon: <ScienceIcon /> },
      { text: "Health Records", path: "/health-records", icon: <LocalHospitalIcon /> },
      { text: "Welfare Indicators", path: "/welfare-indicators", icon: <FavoriteIcon /> },
      { text: "Performance Metrics", path: "/performance-metrics", icon: <SpeedIcon /> },
    ],
  },
  {
    group: "Feed Management",
    items: [
      { text: "Feed Programs", path: "/feed-programs", icon: <RestaurantIcon /> },
      { text: "Feed Intake", path: "/feed-intake", icon: <FastfoodIcon /> },
    ],
  },
  {
    group: "Environment & Housing",
    items: [
      { text: "Environmental Factors", path: "/environmental-factors", icon: <NatureIcon /> },
      { text: "Housing Conditions", path: "/housing-conditions", icon: <ApartmentIcon /> },
      { text: "Water Quality", path: "/water-quality", icon: <WaterIcon /> },
    ],
  },
  {
    group: "Operations",
    items: [
      { text: "Operational Records", path: "/operational-records", icon: <BuildIcon /> },
    ],
  },
];

type FarmSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function FarmSidebar({ open, onClose }: FarmSidebarProps) {
  const location = useLocation();
  const isSmUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("sm"));

  return (
    <StyledSidebar open={open}>
      <List
        subheader={
          <ListSubheader component="div" id="nested-list-subheader" sx={{ fontWeight: "bold" }}>
            Data Entry Menu
          </ListSubheader>
        }
      >
        {farmMenu.map(({ group, items }) => (
          <li key={group}>
            <ListSubheader sx={{ bgcolor: "background.paper" }}>{group}</ListSubheader>
            {items.map(({ text, path, icon }) => (
              <Tooltip
                key={text}
                title={!open ? text : ""}
                placement="right"
                arrow
                disableHoverListener={open}
              >
                <ListItemButtonStyled
                  component={NavLink}
                  to={path}
                  onClick={() => {
                    if (!isSmUp) onClose();
                  }}
                  className={({ isActive }) => (isActive ? "active" : "")}
                  sx={{ justifyContent: open ? "initial" : "center" }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                      color: location.pathname === path ? "primary.main" : "inherit",
                    }}
                  >
                    {icon}
                  </ListItemIcon>
                  {open && <ListItemText primary={text} />}
                </ListItemButtonStyled>
              </Tooltip>
            ))}
          </li>
        ))}
      </List>
    </StyledSidebar>
  );
}

