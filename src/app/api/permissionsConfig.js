
export default {
  "/api/protected/user": {
    "GET": ["admin", "user"],
    "POST": ["admin"],
    "PUT": ["admin"],
    "DELETE": ["admin"]
  },
  "/api/protected/user_role": {
    "GET": ["admin", "user"],
    "POST": ["admin", "can_manage_users"],
    "PUT": ["admin", "can_manage_users"],
    "DELETE": ["admin", "can_manage_users"]
  },
  "/api/protected/workspace": {
    "GET": ["admin", "user"],
    "POST": ["admin", "can_manage_workspace"],
    "PUT": ["admin", "can_manage_workspace"],
    "DELETE": ["admin", "can_manage_workspace"]
  },
  "/api/protected/invitation": {
    "GET": ["admin", "user"],
    "POST": ["admin", "can_manage_invitations"],
    "PUT": ["admin", "can_manage_invitations"],
    "DELETE": ["admin", "can_manage_invitations"]
  },
  "/api/protected/role": {
    "GET": ["admin", "user"],
    "POST": ["admin"],
    "PUT": ["admin"],
    "DELETE": ["admin"]
  }
};
