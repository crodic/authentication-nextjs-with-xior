import ProfileView from './profile-view';

export default async function ProfilePage() {
    // const userData = await getUserData();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <ProfileView />
            </div>
        </div>
    );
}
