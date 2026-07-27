export const manifest = {
  screens: {
    scr_hyx8qc: { name: "Splash", route: "/splash", position: { "x": 160, "y": 220 } },
    scr_w94lne: { name: "Login / Register", route: "/auth", position: { "x": 1560, "y": 220 } },
    scr_1titvj: { name: "Role Selection", route: "/onboarding/role", position: { "x": 2960, "y": 220 } },
    scr_frplir: { name: "Dashboard", route: "/", position: { "x": 160, "y": 2200 } },
    scr_l9g9ru: { name: "Report a Rescue", route: "/report", position: { "x": 1560, "y": 2200 } },
    scr_3cvm0v: { name: "Notifications", route: "/notifications", position: { "x": 2960, "y": 2200 } }
  },
  sections: {
    sec_d3y218: { name: "Onboarding & Auth", x: 0, y: 0, width: 4320, height: 1180 },
    sec_ztof9j: { name: "Main App", x: 0, y: 1980, width: 4320, height: 1180 }
  },
  layers: [
  { kind: "section", id: "sec_d3y218", children: [
    { kind: "screen", id: "scr_hyx8qc" },
    { kind: "screen", id: "scr_w94lne" },
    { kind: "screen", id: "scr_1titvj" }]
  },
  { kind: "section", id: "sec_ztof9j", children: [
    { kind: "screen", id: "scr_frplir" },
    { kind: "screen", id: "scr_l9g9ru" },
    { kind: "screen", id: "scr_3cvm0v" }]
  }]

};