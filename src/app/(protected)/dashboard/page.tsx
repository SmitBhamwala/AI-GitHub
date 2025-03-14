"use client";

import useProject from "@/hooks/use-project";
import { Github } from "lucide-react";
import Link from "next/link";
import CommitLog from "./commit-log";
import AskQuestionCard from "./ask-question-card";
import MeetingCard from "./meeting-card";
import ArchiveButton from "./archive-button";
import InviteButton from "./invite-button";
import TeamMembers from "./team-members";

export default function DashboardPage() {
	const { project } = useProject();

	return (
		<div>
			<div className="flex items-center justify-between flex-wrap gap-y-4">
				<Link
					href={project?.gitHubURL ?? ""}
					target="_blank"
					className="flex items-center gap-1 text-sm font-medium text-white w-fit rounded-md bg-primary px-4 py-3"
				>
					<Github className="size-5 flex-shrink-0" />
					<span>{project?.name}&apos;s Source Code</span>
				</Link>

				<div className="h-4"></div>

				<div className="flex items-center gap-4">
					<TeamMembers />
					<InviteButton /> 
					<ArchiveButton />
				</div>
			</div>
			<div className="mt-4">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
					<AskQuestionCard />
					<MeetingCard />
				</div>
			</div>
			<div className="mt-8"></div>
			{project && <CommitLog />}
		</div>
	);
}
