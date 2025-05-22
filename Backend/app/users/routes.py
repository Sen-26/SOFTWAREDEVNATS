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
        'avatar_path': current_user.avatar_path,
        'coin': current_user.coin,
        'trash_collected': current_user.trash_collected,
        'unlocked_items': current_user.unlocked_items,
        'equipped_items': current_user.equipped_items,
        'streak': current_user.streak,
        'last_streak_date': current_user.last_streak_date,
        'latitude': current_user.latitude,
        'longitude': current_user.longitude,
        'quests': current_user.quests
    })

@users_bp.route('/<int:user_id>', methods=['GET'])
@token_required
def get_user_profile(current_user, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({
        'id': user.id,
        'username': user.username,
        'avatar_path': user.avatar_path,
        'coin': user.coin,
        'trash_collected': user.trash_collected,
        'unlocked_items': user.unlocked_items,
        'equipped_items': user.equipped_items,
        'streak': user.streak,
        'last_streak_date': user.last_streak_date,
        'latitude': user.latitude,
        'longitude': user.longitude,
        'quests': user.quests
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


@users_bp.route('/me/coin', methods=['POST'])
@token_required
def add_coin(current_user):
    data = request.get_json()
    amount = data.get('amount', 0)
    if not isinstance(amount, int):
        return jsonify({'error': 'Invalid amount'}), 400
    current_user.coin += amount
    db.session.commit()
    return jsonify({'coin': current_user.coin})

@users_bp.route('/me/trash_collected', methods=['POST'])
@token_required
def add_trash_collected(current_user):
    data = request.get_json()
    amount = data.get('amount', 0)
    if not isinstance(amount, int):
        return jsonify({'error': 'Invalid amount'}), 400
    current_user.trash_collected += amount
    db.session.commit()
    return jsonify({'trash_collected': current_user.trash_collected})

@users_bp.route('/me/add_to_unlocked_items', methods=['POST'])
@token_required
def add_to_unlocked_items(current_user):
    data = request.get_json()
    item = data.get('item')
    if not item or not isinstance(item, str):
        return jsonify({'error': 'Invalid item'}), 400
    if item not in current_user.unlocked_items:
        current_user.unlocked_items.append(item)
        db.session.commit()
    return jsonify({'unlocked_items': current_user.unlocked_items})

@users_bp.route('/me/equip_item', methods=['POST'])
@token_required
def equip_item(current_user):
    data = request.get_json()
    new_item = data.get('new_item')
    if not new_item or not isinstance(new_item, str):
        return jsonify({'error': 'Invalid new_item'}), 400
    if new_item not in current_user.unlocked_items:
        return jsonify({'error': 'Item not unlocked'}), 400
    # Extract type from new_item (e.g., 'map_1' -> 'map')
    try:
        new_type = new_item.split('_', 1)[0]
    except Exception:
        return jsonify({'error': 'Invalid item format'}), 400
    # Remove any equipped item of the same type
    updated_equipped = [item for item in current_user.equipped_items if not item.startswith(new_type + '_')]
    updated_equipped.append(new_item)
    current_user.equipped_items = updated_equipped
    db.session.commit()
    return jsonify({'equipped_items': current_user.equipped_items})

@users_bp.route('/me/location', methods=['POST'])
@token_required
def update_location(current_user):
    data = request.get_json()
    lat = data.get('latitude')
    lng = data.get('longitude')
    if lat is None or lng is None:
        return jsonify({'error': 'Latitude and longitude required'}), 400
    current_user.latitude = lat
    current_user.longitude = lng
    db.session.commit()
    return jsonify({'message': 'Location updated'})

@users_bp.route('/me/update-quests', methods=['POST'])
@token_required
def update_quests(current_user):
    data = request.get_json()
    quests = data.get('quests')
    if not isinstance(quests, list) or len(quests) != 12 or not all(isinstance(q, int) for q in quests):
        return jsonify({'error': 'Quests must be a list of 12 integers'}), 400
    current_user.quests = quests
    db.session.commit()
    return jsonify({'quests': current_user.quests})

import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@users_bp.route('/nearby', methods=['POST'])
@token_required
def get_users_nearby(current_user):
    data = request.get_json()
    radius = data.get('radius', 1)  # default 1 km
    if current_user.latitude is None or current_user.longitude is None:
        return jsonify({'error': 'Current user location not set'}), 400
    users = User.query.filter(User.id != current_user.id, User.latitude.isnot(None), User.longitude.isnot(None)).all()
    nearby_ids = []
    for user in users:
        dist = haversine(current_user.latitude, current_user.longitude, user.latitude, user.longitude)
        if dist <= radius:
            nearby_ids.append(user.id)
    return jsonify({'nearby_user_ids': nearby_ids})
