import subprocess

def run(cmd):
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout + result.stderr

# Delete existing vars
print("Deleting production...")
print(run(['eas', 'env:delete', 'production', '--variable-name', 'EXPO_PUBLIC_FIREBASE_API_KEY', '--variable-environment', 'production', '--non-interactive']))

print("Deleting preview...")
print(run(['eas', 'env:delete', 'preview', '--variable-name', 'EXPO_PUBLIC_FIREBASE_API_KEY', '--variable-environment', 'preview', '--non-interactive']))

# Read from .env
with open('.env') as f:
    for line in f:
        line = line.strip()
        if 'EXPO_PUBLIC_FIREBASE_API_KEY' in line and '=' in line:
            key = line.split('=', 1)[1]
            break

print(f"Got key: [{key[:10]}...{key[-10:]}] len={len(key)}")

# Create
print("Creating production...")
r = run(['eas', 'env:create', 'production', '--name', 'EXPO_PUBLIC_FIREBASE_API_KEY', '--value', key, '--scope', 'project', '--visibility', 'sensitive', '--non-interactive'])
print(r)

print("Creating preview...")
r = run(['eas', 'env:create', 'preview', '--name', 'EXPO_PUBLIC_FIREBASE_API_KEY', '--value', key, '--scope', 'project', '--visibility', 'sensitive', '--non-interactive'])
print(r)
