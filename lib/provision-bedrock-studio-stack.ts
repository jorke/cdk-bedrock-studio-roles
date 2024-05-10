import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as iam from 'aws-cdk-lib/aws-iam'

export class ProvisionBedrockStudioStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const serviceRole = new iam.Role(this, 'BedrockStudioServiceRole', {
      assumedBy: new iam.ServicePrincipal('datazone.amazonaws.com').withConditions({
        "StringEquals": {
          "aws:SourceAccount": this.account
        },
        "ForAllValues:StringLike": {
          "aws:TagKeys": "datazone*"
        }
      })
    })

    serviceRole.attachInlinePolicy(new iam.Policy(this, 'BedrockStudioServicePolicy', {
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "datazone:GetDomain",
            "datazone:ListProjects",
            "datazone:GetProject",
            "datazone:CreateProject",
            "datazone:UpdateProject",
            "datazone:DeleteProject",
            "datazone:ListProjectMemberships",
            "datazone:CreateProjectMembership",
            "datazone:DeleteProjectMembership",
            "datazone:ListEnvironments",
            "datazone:GetEnvironment",
            "datazone:CreateEnvironment",
            "datazone:UpdateEnvironment",
            "datazone:DeleteEnvironment",
            "datazone:ListEnvironmentBlueprints",
            "datazone:GetEnvironmentBlueprint",
            "datazone:CreateEnvironmentBlueprint",
            "datazone:UpdateEnvironmentBlueprint",
            "datazone:DeleteEnvironmentBlueprint",
            "datazone:ListEnvironmentBlueprintConfigurations",
            "datazone:ListEnvironmentBlueprintConfigurationSummaries",
            "datazone:ListEnvironmentProfiles",
            "datazone:GetEnvironmentProfile",
            "datazone:CreateEnvironmentProfile",
            "datazone:UpdateEnvironmentProfile",
            "datazone:DeleteEnvironmentProfile",
            "datazone:UpdateEnvironmentDeploymentStatus",
            "datazone:GetEnvironmentCredentials",
            "datazone:ListGroupsForUser",
            "datazone:SearchUserProfiles",
            "datazone:SearchGroupProfiles",
            "datazone:GetUserProfile",
            "datazone:GetGroupProfile"
          ],
          resources: ["*"],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["ram:GetresourceshareAssociations"],
          resources: ["*"],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "bedrock:InvokeModel",
            "bedrock:InvokeModelWithResponseStream",
            "bedrock:GetFoundationModelAvailability"
          ],
          resources: ["*"],
        }),
      ],
    }))


    const provisionRole = new iam.Role(this, 'BedrockStudioProvisionRole', {
      assumedBy: new iam.ServicePrincipal('datazone.amazonaws.com').withConditions({
        "StringEquals": {
          "aws:SourceAccount": this.account
        },
      })
    })

    provisionRole.attachInlinePolicy(new iam.Policy(this, 'BedrockStudioProvisionePolicy', {
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "iam:CreateRole",
            "iam:GetRolePolicy",
            "iam:DetachRolePolicy",
            "iam:AttachRolePolicy",
            "iam:UpdateAssumeRolePolicy"
          ],
          resources: ["arn:aws:iam::*:role/DataZoneBedrockProjectRole*"],
          conditions: {
              "StringEquals": {
                "iam:PermissionsBoundary": `arn:aws:iam::${this.account}:policy/AmazonDataZoneBedrockPermissionsBoundary`,
                "aws:CalledViaFirst": [
                  "cloudformation.amazonaws.com"
                ]
              },
              "Null": {
                "aws:resourcesTag/AmazonDataZoneEnvironment": "false"
              }
            }
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "iam:CreateRole",
              "iam:GetRolePolicy",
              "iam:DetachRolePolicy",
              "iam:AttachRolePolicy",
              "iam:UpdateAssumeRolePolicy"
            ],
            resources: [
              "arn:aws:iam::*:role/BedrockStudio*",
              "arn:aws:iam::*:role/AmazonBedrockExecution*"
            ],
            conditions: {
              "StringEquals": {
                "aws:CalledViaFirst": [
                  "cloudformation.amazonaws.com"
                ]
              },
              "Null": {
                "aws:resourcesTag/AmazonDataZoneEnvironment": "false"
              }
            }
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "iam:PassRole"
            ],
            resources: ["arn:aws:iam::*:role/AmazonBedrockExecution*"],
            conditions: {
              "StringEquals": {
                "iam:PassedToService": [
                  "bedrock.amazonaws.com"
                ],
                "aws:CalledViaFirst": [
                  "cloudformation.amazonaws.com"
                ]
              }
            }
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "iam:PassRole"
            ],
            resources: [
              "arn:aws:iam::*:role/BedrockStudio*"
            ],
            conditions: {
              "StringEquals": {
                "iam:PassedToService": [
                  "lambda.amazonaws.com"
                ],
                "aws:CalledViaFirst": [
                  "cloudformation.amazonaws.com"
                ]
              }
            }
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "iam:DeleteRole",
              "iam:GetRole",
              "iam:DetachRolePolicy",
              "iam:GetPolicy",
              "iam:DeleteRolePolicy",
              "iam:PutRolePolicy"
            ],
            resources: [
              "arn:aws:iam::*:role/DataZoneBedrockProjectRole*",
              "arn:aws:iam::*:role/AmazonBedrock*",
              "arn:aws:iam::*:role/BedrockStudio*"
            ],
            conditions: {
              "StringEquals": {
                "aws:CalledViaFirst": [
                  "cloudformation.amazonaws.com"
                ]
              }
            }
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "cloudformation:CreateStack",
              "cloudformation:UpdateStack",
              "cloudformation:Tagresources"
            ],
            resources: [
              "arn:aws:cloudformation:*:*:stack/DataZone*"
            ],
            conditions: {
              "ForAnyValue:StringLike": {
                "aws:TagKeys": "AmazonDataZoneEnvironment"
              },
              "Null": {
                "aws:resourcesTag/AmazonDataZoneEnvironment": "false"
              }
            }
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "cloudformation:DeleteStack",
              "cloudformation:DescribeStacks",
              "cloudformation:DescribeStackEvents"
            ],
            resources: [
              "arn:aws:cloudformation:*:*:stack/DataZone*"
            ]
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "bedrock:GetAgent",
              "bedrock:GetAgentActionGroup",
              "bedrock:GetAgentAlias",
              "bedrock:GetAgentKnowledgeBase",
              "bedrock:GetKnowledgeBase",
              "bedrock:GetDataSource",
              "bedrock:GetGuardrail"
            ],
            resources: ["*"],
            conditions: {
              "StringEquals": {
                "aws:CalledViaFirst": [
                  "cloudformation.amazonaws.com"
                ]
              }
            }
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "bedrock:DeleteGuardrail"
            ],
            resources: ["*"],
            conditions: {
              "StringEquals": {
                "aws:CalledViaFirst": [
                  "cloudformation.amazonaws.com"
                ]
              }
            }
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "bedrock:CreateAgent",
              "bedrock:UpdateAgent",
              "bedrock:DeleteAgent",
              "bedrock:ListAgents",
              "bedrock:CreateAgentActionGroup",
              "bedrock:UpdateAgentActionGroup",
              "bedrock:DeleteAgentActionGroup",
              "bedrock:ListAgentActionGroups",
              "bedrock:CreateAgentAlias",
              "bedrock:UpdateAgentAlias",
              "bedrock:DeleteAgentAlias",
              "bedrock:ListAgentAliases",
              "bedrock:AssociateAgentKnowledgeBase",
              "bedrock:DisassociateAgentKnowledgeBase",
              "bedrock:UpdateAgentKnowledgeBase",
              "bedrock:ListAgentKnowledgeBases",
              "bedrock:PrepareAgent"
            ],
            resources: ["*"],
            conditions: {
              "StringEquals": {
                "aws:CalledViaFirst": [
                  "cloudformation.amazonaws.com"
                ]
              },
              "Null": {
                "aws:resourcesTag/AmazonDataZoneProject": "false"
              }
            }
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "aoss:CreateAccessPolicy",
              "aoss:DeleteAccessPolicy",
              "aoss:UpdateAccessPolicy",
              "aoss:GetAccessPolicy",
              "aoss:ListAccessPolicies",
              "aoss:CreateSecurityPolicy",
              "aoss:DeleteSecurityPolicy",
              "aoss:UpdateSecurityPolicy",
              "aoss:GetSecurityPolicy",
              "aoss:ListSecurityPolicies"
            ],
            resources: ["*"],
            conditions: {
              "StringEquals": {
                "aws:CalledViaFirst": [
                  "cloudformation.amazonaws.com"
                ]
              }
            }
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "aoss:UpdateCollection",
              "aoss:DeleteCollection",
              "aoss:BatchGetCollection",
              "aoss:ListCollections",
              "aoss:CreateCollection"
            ],
            resources: ["*"],
            conditions: {
              "StringEquals": {
                "aws:CalledViaFirst": [
                  "cloudformation.amazonaws.com"
                ]
              },
              "Null": {
                "aws:resourcesTag/AmazonDataZoneProject": "false"
              }
            }
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "bedrock:CreateKnowledgeBase",
              "bedrock:UpdateKnowledgeBase",
              "bedrock:DeleteKnowledgeBase",
              "bedrock:CreateDataSource",
              "bedrock:UpdateDataSource",
              "bedrock:DeleteDataSource",
              "bedrock:ListKnowledgeBases",
              "bedrock:ListDataSources"
            ],
            resources: ["*"],
            conditions: {
              "StringEquals": {
                "aws:CalledViaFirst": [
                  "cloudformation.amazonaws.com"
                ]
              },
              "Null": {
                "aws:resourcesTag/AmazonDataZoneProject": "false"
              }
            }
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "bedrock:CreateGuardrail",
              "bedrock:CreateGuardrailVersion",
              "bedrock:ListGuardrails",
              "bedrock:ListTagsForresources",
              "bedrock:Tagresources",
              "bedrock:Untagresources",
              "bedrock:UpdateGuardrail"
            ],
            resources: ["*"],
            conditions: {
              "StringEquals": {
                "aws:CalledViaFirst": [
                  "cloudformation.amazonaws.com"
                ]
              },
              "Null": {
                "aws:resourcesTag/AmazonDataZoneProject": "false"
              }
            }
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "lambda:AddPermission",
              "lambda:CreateFunction",
              "lambda:ListFunctions",
              "lambda:UpdateFunctionCode",
              "lambda:UpdateFunctionConfiguration",
              "lambda:InvokeFunction",
              "lambda:ListVersionsByFunction",
              "lambda:PublishVersion"
            ],
            resources: [
              `arn:aws:lambda:${this.region}:${this.account}:function:br-studio*`,
              `arn:aws:lambda:${this.region}:${this.account}:function:OpensearchIndexLambda*`,
              `arn:aws:lambda:${this.region}:${this.account}:function:IngestionTriggerLambda*`
            ],
            conditions: {
              "StringEquals": {
                "aws:CalledViaFirst": [
                  "cloudformation.amazonaws.com"
                ]
              },
              "Null": {
                "aws:resourcesTag/AmazonDataZoneEnvironment": "false"
              }
            }
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "lambda:GetFunction",
              "lambda:DeleteFunction",
              "lambda:RemovePermission"
            ],
            resources: [
              `arn:aws:lambda:${this.region}:${this.account}:function:br-studio*`,
              `arn:aws:lambda:${this.region}:${this.account}:function:OpensearchIndexLambda*`,
              `arn:aws:lambda:${this.region}:${this.account}:function:IngestionTriggerLambda*`
            ],
            conditions: {
              "StringEquals": {
                "aws:CalledViaFirst": [
                  "cloudformation.amazonaws.com"
                ]
              }
            }
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "logs:CreateLogGroup",
              "logs:PutRetentionPolicy",
              "logs:DeleteLogGroup"
            ],
            resources: [
              "arn:aws:logs:*:*:log-group:/aws/lambda/br-studio-*",
              "arn:aws:logs:*:*:log-group:datazone-*"
            ],
            conditions: {
              "StringEquals": {
                "aws:CalledViaFirst": "cloudformation.amazonaws.com"
              }
            }
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "bedrock:ListTagsForresources",
              "aoss:ListTagsForresources",
              "lambda:ListTags",
              "iam:ListRoleTags",
              "iam:ListPolicyTags"
            ],
            resources: ["*"],
            conditions: {
              "StringEquals": {
                "aws:CalledViaFirst": "cloudformation.amazonaws.com"
              }
            }
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "iam:TagRole",
              "iam:TagPolicy",
              "iam:UntagRole",
              "iam:UntagPolicy",
              "logs:TagLogGroup",
              "bedrock:Tagresources",
              "bedrock:Untagresources",
              "bedrock:ListTagsForresources",
              "aoss:Tagresources",
              "aoss:UnTagresources",
              "aoss:ListTagsForresources",
              "lambda:Tagresources",
              "lambda:UnTagresources",
              "lambda:ListTags"
            ],
            resources: ["*"],
            conditions: {
              "ForAnyValue:StringLike": {
                "aws:TagKeys": "AmazonDataZoneEnvironment"
              },
              "Null": {
                "aws:resourcesTag/AmazonDataZoneEnvironment": "false"
              },
              "StringEquals": {
                "aws:CalledViaFirst": [
                  "cloudformation.amazonaws.com"
                ]
              }
            }
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "bedrock:Tagresources"
            ],
            resources: [
              `arn:aws:bedrock:${this.region}:${this.account}:agent-alias/*`
            ],
            conditions: {
              "StringEquals": {
                "aws:CalledViaFirst": [
                  "cloudformation.amazonaws.com"
                ]
              },
              "ForAnyValue:StringLike": {
                "aws:TagKeys": "AmazonDataZoneEnvironment"
              }
            }
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "s3:GetObject"
            ],
            resources: ["*"],
            conditions: {
              "StringEquals": {
                "aws:CalledViaFirst": [
                  "cloudformation.amazonaws.com"
                ]
              },
              "StringNotEquals": {
                "aws:resourcesAccount": "${aws:PrincipalAccount}"
              }
            }
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "secretsmanager:GetRandomPassword"
            ],
            resources: ["*"],
            conditions: {
              "StringEquals": {
                "aws:CalledViaFirst": [
                  "cloudformation.amazonaws.com"
                ]
              }
            }
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "secretsmanager:CreateSecret",
              "secretsmanager:Tagresources",
              "secretsmanager:Untagresources",
              "secretsmanager:PutresourcesPolicy",
              "secretsmanager:DeleteresourcesPolicy",
              "secretsmanager:DeleteSecret"
            ],
            resources: ["*"],
            conditions: {
              "StringEquals": {
                "aws:CalledViaFirst": [
                  "cloudformation.amazonaws.com"
                ]
              },
              "Null": {
                "aws:resourcesTag/AmazonDataZoneEnvironment": "false"
              }
            }
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "s3:CreateBucket",
              "s3:DeleteBucket",
              "s3:PutBucketTagging",
              "s3:PutEncryptionConfiguration",
              "s3:PutBucketVersioning",
              "s3:PutBucketCORS",
              "s3:PutBucketPublicAccessBlock",
              "s3:PutBucketPolicy",
              "s3:PutLifecycleConfiguration",
              "s3:DeleteBucketPolicy"
            ],
            resources:["arn:aws:s3:::br-studio-*"],
            conditions: {
              "StringEquals": {
                "aws:CalledViaFirst": [
                  "cloudformation.amazonaws.com"
                ]
              }
            }
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["iam:CreateServiceLinkedRole"],
            resources: ["*"],
            conditions: {
              "StringEquals": {
                "iam:AWSServiceName": "observability.aoss.amazonaws.com",
                "aws:CalledViaFirst": "cloudformation.amazonaws.com"
              }
            }
          })
        ]
      }
    ))

    new cdk.CfnOutput(this, "studio-role-arn", {
      value: serviceRole.roleArn
    })

    new cdk.CfnOutput(this, "provision-role-arn", {
      value: provisionRole.roleArn
    })
  }
}
