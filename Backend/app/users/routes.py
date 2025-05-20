import os
from flask import Blueprint, jsonify, request, send_file
from app.models import User
from app.auth.routes import token_required
from app import db

# --- React Native Profile Screen Avatar Fetch Instructions ---
# 1. API base URL to use in frontend:
#    const API_BASE = 'http://<YOUR_SERVER_HOST>:<PORT>'; // e.g. 'http://192.168.193.45:5431'
#
# 2. Import and use Auth context in frontend:
#    import { useAuth } from './_layout';
#    // In your Profile component:
#    const { token } = useAuth();
#
# 3. Fetch profile and avatar in useFocusEffect in frontend:
#    useFocusEffect(
#      React.useCallback(() => {
#        fetch(`${API_BASE}/users/me`, {
#          headers: { Authorization: `Bearer ${token}` },
#        })
#          .then(res => res.json())
#          .then(data => {
#            setProfileName(data.username);
#            // Build avatar URL from user_id
#            const avatarUrl = `${API_BASE}/users/${data.id}/avatar?t=${Date.now()}`;
#            setAvatarUri(avatarUrl);
#          })
#          .catch(console.error);
#      }, [token])
#    );
#
# 4. Use avatarUri in your Image in frontend:
#    <Image
#      source={ avatarUri ? { uri: avatarUri } : require('../assets/avatar-placeholder.jpg') }
#      style={styles.avatar}
#    />
# ------------------------------------------------------------

AVATAR_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "avatars")
os.makedirs(AVATAR_DIR, exist_ok=True)

users_bp = Blueprint('users', __name__)

@users_bp.route('/me', methods=['GET'])
@token_required
def get_my_profile(current_user):
    return jsonify({
        'id': current_user.id,
        'username': current_user.username,
        'avatar_path': current_user.avatar_path
    })

@users_bp.route('/me/avatar', methods=['POST'])
@token_required
def update_profile_picture(current_user):
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    ext = os.path.splitext(file.filename)[1]
    filename = f"user_{current_user.id}{ext}"
    filepath = os.path.join(AVATAR_DIR, filename)
    file.save(filepath)
    current_user.avatar_path = filename
    db.session.commit()
    return jsonify({'message': 'Profile picture updated successfully'})

@users_bp.route('/<int:user_id>/avatar', methods=['GET'])
@token_required
def get_profile_picture(current_user, user_id):
    user = User.query.get(user_id)
    if user and user.avatar_path:
        filepath = os.path.join(AVATAR_DIR, user.avatar_path)
        if os.path.exists(filepath):
            return send_file(filepath)
    return jsonify({'error': 'Avatar not found'}), 404

# Add more user-related endpoints here
