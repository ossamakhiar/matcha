import { UserInfos } from "../../types/profile";

type UserBadgeProps = {
  user: UserInfos;
};

export function UserBadge({ user }: UserBadgeProps) {
  const isSelf = user.isSelf;

  return (
    <div className="relative h-12 w-12">
      {isSelf && (
        <span
          className="
            absolute inset-0
            rounded-full
            bg-blue-500/30
            animate-ping
          "
        />
      )}

      <img
        src={user.profilePicture}
        alt=""
        className="
          relative z-10
          h-12 w-12
          rounded-full
          object-cover
          ring-2 ring-blue-600
          shadow-md
        "
      />
    </div>
  );
}
