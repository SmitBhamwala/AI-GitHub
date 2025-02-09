import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";
import { indexGitHubRepo } from "@/lib/github-loader";

export const projectRouter = createTRPCRouter({
	createProject: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				gitHubURL: z.string(),
				gitHubToken: z.string().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const project = await ctx.db.project.create({
				data: {
					name: input.name,
					gitHubURL: input.gitHubURL,
					userToProjects: {
						create: {
							userId: ctx.user.user.id
						}
					}
				}
			});
			await indexGitHubRepo(project.id, input.gitHubURL, input.gitHubToken);
			await pollCommits(project.id);
			return project;
		}),
	getProjects: protectedProcedure.query(async ({ ctx }) => {
		return await ctx.db.project.findMany({
			where: {
				userToProjects: {
					some: {
						userId: ctx.user.user.id
					}
				}
			}
		});
	}),
	getCommits: protectedProcedure
		.input(
			z.object({
				projectId: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			try {
				await pollCommits(input.projectId);
			} catch (error) {
				console.error(error);
			}
			return await ctx.db.commits.findMany({
				where: {
					projectId: input.projectId
				},
				orderBy: { commitDate: "desc" },
				take: 10
			});
		}),
	saveAnswer: protectedProcedure
		.input(
			z.object({
				question: z.string(),
				answer: z.string(),
				projectId: z.string(),
				fileReferences: z.array(
					z.object({
						fileName: z.string(),
						sourceCode: z.string(),
						summary: z.string()
					})
				)
			})
		)
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.questions.create({
				data: {
					question: input.question,
					answer: input.answer,
					projectId: input.projectId,
					fileReferences: input.fileReferences,
					userId: ctx.user.user.id
				}
			});
		}),
	getQuestions: protectedProcedure
		.input(
			z.object({
				projectId: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			return await ctx.db.questions.findMany({
				where: {
					projectId: input.projectId
				},
				include: {
					user: true
				},
				orderBy: {
					createdAt: "desc"
				}
			});
		})
});
