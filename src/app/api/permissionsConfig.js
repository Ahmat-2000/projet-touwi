// Purpose: This file contains the permissions configuration for each route in the API.
// Each route can have different permissions for different methods (GET, POST, PUT, DELETE)
// All the available permissions are handled in the permissionService.js file and are checked in the middleware.js file

export default {
  "/api/protected/user": {
    "GET": ["admin", "user"],
    "POST": ["admin"]
  },
  "/api/protected/user/id": {
    "GET": ["admin", "user"],
    "PUT": ["admin"],
    "DELETE": ["admin"]
  },



  "/api/protected/user_role": {
    "GET": ["admin", "user"],
    "POST": ["admin", "can_manage_users"]
  },
  "/api/protected/user_role/id": {
    "GET": ["admin", "user"],
    "PUT": ["admin", "can_manage_users"],
    "DELETE": ["admin", "can_manage_users"]
  },



  "/api/protected/workspace": {
    "GET": ["admin", "user"],
    "POST": ["admin", "can_manage_workspace"]
  },
  "/api/protected/workspace/id": {
    "GET": ["admin", "user"],
    "PUT": ["admin", "can_manage_workspace"],
    "DELETE": ["admin", "can_manage_workspace", "user"]
  },



  "/api/protected/invitation": {
    "GET": ["admin", "user"],
    "POST": ["admin", "can_manage_invitations"]
  },
  "/api/protected/invitation/id": {
    "GET": ["admin", "user"],
    "PUT": ["admin", "can_manage_invitations"],
    "DELETE": ["admin", "can_manage_invitations"]
  },
  "/api/protected/invitation/accept": {
    "POST": ["admin", "user"]
  },
  "/api/protected/invitation/reject": {
    "POST": ["admin", "user"]
  },

  

  "/api/protected/role": {
    "GET": ["admin", "user"],
    "POST": ["admin"]
  },
  "/api/protected/role/id": {
    "GET": ["admin", "user"],
    "PUT": ["admin"],
    "DELETE": ["admin"]
  },
};
