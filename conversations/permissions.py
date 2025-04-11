from rest_framework import permissions

class HasConversationAccess(permissions.BasePermission):
    """
    Permission to check if user has access to a conversation.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Admin users have full access
        if user.role == 'admin':
            return True
        
        # Check if the user created the conversation
        if obj.created_by == user:
            return True
        
        # Check if the conversation is public (for read operations)
        if request.method in permissions.SAFE_METHODS and obj.is_public:
            return True
        
        # Check if the user has explicit access
        try:
            access = obj.user_access.get(user=user)
            
            # For read operations, any access level is sufficient
            if request.method in permissions.SAFE_METHODS:
                return True
            
            # For write operations, need edit or admin access
            if request.method in ['PUT', 'PATCH']:
                return access.access_level in ['edit', 'admin']
            
            # For delete operations, need admin access
            if request.method == 'DELETE':
                return access.access_level == 'admin'
            
            # For other operations (like POST), need edit or admin access
            return access.access_level in ['edit', 'admin']
        except:
            return False
