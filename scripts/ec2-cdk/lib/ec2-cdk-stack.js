"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ec2CdkStack = void 0;
const ec2 = require("aws-cdk-lib/aws-ec2");
const cdk = require("aws-cdk-lib");
const iam = require("aws-cdk-lib/aws-iam");
const path = require("path");
// import { KeyPair } from 'cdk-ec2-key-pair';
const aws_s3_assets_1 = require("aws-cdk-lib/aws-s3-assets");
const cdk_ec2_key_pair_1 = require("cdk-ec2-key-pair");
class Ec2CdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Create a Key Pair to be used with this EC2 Instance
        // Temporarily disabled since `cdk-ec2-key-pair` is not yet CDK v2 compatible
        // const key = new KeyPair(this, 'KeyPair', {
        //   name: 'cdk-keypair',
        //   description: 'Key Pair created with CDK Deployment',
        // });
        // key.grantReadOnPublicKey
        // Put your public key here, so that you can SSH to the EC2 Instance
        const key = new cdk_ec2_key_pair_1.KeyPair(this, 'Test-Key-Pair', {
            name: 'imported-key-pair',
            publicKey: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGGAFmZQauDpj8VlIL/g122WTINQj7PZhYEer9kaY2bP'
        });
        // Create new VPC with 2 Subnets
        const vpc = new ec2.Vpc(this, 'VPC', {
            natGateways: 0,
            subnetConfiguration: [{
                    cidrMask: 24,
                    name: "asterisk",
                    subnetType: ec2.SubnetType.PUBLIC
                }]
        });
        // Allow SSH (TCP Port 22) access from anywhere
        const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
            vpc,
            description: 'Allow SSH (TCP port 22) in',
            allowAllOutbound: true
        });
        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH Access');
        const role = new iam.Role(this, 'ec2Role', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')
        });
        role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));
        // Use Latest Amazon Linux Image - CPU Type ARM64
        const ami = new ec2.AmazonLinuxImage({
            generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
            cpuType: ec2.AmazonLinuxCpuType.ARM_64
        });
        // Create the instance using the Security Group, AMI, and KeyPair defined in the VPC created
        const ec2Instance = new ec2.Instance(this, 'Instance', {
            vpc,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
            machineImage: ami,
            securityGroup: securityGroup,
            keyName: key.keyPairName,
            role: role
        });
        // Create an asset that will be used as part of User Data to run on first load
        const asset = new aws_s3_assets_1.Asset(this, 'Asset', { path: path.join(__dirname, '../src/config.sh') });
        const localPath = ec2Instance.userData.addS3DownloadCommand({
            bucket: asset.bucket,
            bucketKey: asset.s3ObjectKey,
        });
        ec2Instance.userData.addExecuteFileCommand({
            filePath: localPath,
            arguments: '--verbose -y'
        });
        asset.grantRead(ec2Instance.role);
        // Create outputs for connecting
        new cdk.CfnOutput(this, 'IP Address', { value: ec2Instance.instancePublicIp });
        // new cdk.CfnOutput(this, 'Key Name', { value: key.keyPairName })
        new cdk.CfnOutput(this, 'Download Key Command', { value: 'aws secretsmanager get-secret-value --secret-id ec2-ssh-key/cdk-keypair/private --query SecretString --output text > cdk-key.pem && chmod 400 cdk-key.pem' });
        new cdk.CfnOutput(this, 'ssh command', { value: 'ssh -i cdk-key.pem -o IdentitiesOnly=yes ec2-user@' + ec2Instance.instancePublicIp });
    }
}
exports.Ec2CdkStack = Ec2CdkStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWMyLWNkay1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImVjMi1jZGstc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQTJDO0FBQzNDLG1DQUFtQztBQUNuQywyQ0FBMEM7QUFDMUMsNkJBQTZCO0FBQzdCLDhDQUE4QztBQUM5Qyw2REFBa0Q7QUFFbEQsdURBQTJDO0FBRTNDLE1BQWEsV0FBWSxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ3hDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsc0RBQXNEO1FBQ3RELDZFQUE2RTtRQUM3RSw2Q0FBNkM7UUFDN0MseUJBQXlCO1FBQ3pCLHlEQUF5RDtRQUN6RCxNQUFNO1FBQ04sMkJBQTJCO1FBRTNCLG9FQUFvRTtRQUNwRSxNQUFNLEdBQUcsR0FBRyxJQUFJLDBCQUFPLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUM3QyxJQUFJLEVBQUUsbUJBQW1CO1lBQ3pCLFNBQVMsRUFBRSxrRkFBa0Y7U0FDOUYsQ0FBQyxDQUFDO1FBRUgsZ0NBQWdDO1FBQ2hDLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO1lBQ25DLFdBQVcsRUFBRSxDQUFDO1lBQ2QsbUJBQW1CLEVBQUUsQ0FBQztvQkFDcEIsUUFBUSxFQUFFLEVBQUU7b0JBQ1osSUFBSSxFQUFFLFVBQVU7b0JBQ2hCLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU07aUJBQ2xDLENBQUM7U0FDSCxDQUFDLENBQUM7UUFFSCwrQ0FBK0M7UUFDL0MsTUFBTSxhQUFhLEdBQUcsSUFBSSxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDakUsR0FBRztZQUNILFdBQVcsRUFBRSw0QkFBNEI7WUFDekMsZ0JBQWdCLEVBQUUsSUFBSTtTQUN2QixDQUFDLENBQUM7UUFDSCxhQUFhLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQTtRQUV0RixNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRTtZQUN6QyxTQUFTLEVBQUUsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUM7U0FDekQsQ0FBQyxDQUFBO1FBRUYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFBO1FBRWpHLGlEQUFpRDtRQUNqRCxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztZQUNuQyxVQUFVLEVBQUUsR0FBRyxDQUFDLHFCQUFxQixDQUFDLGNBQWM7WUFDcEQsT0FBTyxFQUFFLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNO1NBQ3ZDLENBQUMsQ0FBQztRQUVILDRGQUE0RjtRQUM1RixNQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUNyRCxHQUFHO1lBQ0gsWUFBWSxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBQ2hGLFlBQVksRUFBRSxHQUFHO1lBQ2pCLGFBQWEsRUFBRSxhQUFhO1lBQzVCLE9BQU8sRUFBRSxHQUFHLENBQUMsV0FBVztZQUN4QixJQUFJLEVBQUUsSUFBSTtTQUNYLENBQUMsQ0FBQztRQUVILDhFQUE4RTtRQUM5RSxNQUFNLEtBQUssR0FBRyxJQUFJLHFCQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMzRixNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDO1lBQzFELE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTtZQUNwQixTQUFTLEVBQUUsS0FBSyxDQUFDLFdBQVc7U0FDN0IsQ0FBQyxDQUFDO1FBRUgsV0FBVyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQztZQUN6QyxRQUFRLEVBQUUsU0FBUztZQUNuQixTQUFTLEVBQUUsY0FBYztTQUMxQixDQUFDLENBQUM7UUFDSCxLQUFLLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVsQyxnQ0FBZ0M7UUFDaEMsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztRQUMvRSxrRUFBa0U7UUFDbEUsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEtBQUssRUFBRSwySkFBMkosRUFBRSxDQUFDLENBQUE7UUFDdk4sSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsRUFBRSxLQUFLLEVBQUUsb0RBQW9ELEdBQUcsV0FBVyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQTtJQUN4SSxDQUFDO0NBQ0Y7QUE3RUQsa0NBNkVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZWMyIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWMyXCI7XG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuLy8gaW1wb3J0IHsgS2V5UGFpciB9IGZyb20gJ2Nkay1lYzIta2V5LXBhaXInO1xuaW1wb3J0IHsgQXNzZXQgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMtYXNzZXRzJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgS2V5UGFpciB9IGZyb20gJ2Nkay1lYzIta2V5LXBhaXInO1xuXG5leHBvcnQgY2xhc3MgRWMyQ2RrU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvLyBDcmVhdGUgYSBLZXkgUGFpciB0byBiZSB1c2VkIHdpdGggdGhpcyBFQzIgSW5zdGFuY2VcbiAgICAvLyBUZW1wb3JhcmlseSBkaXNhYmxlZCBzaW5jZSBgY2RrLWVjMi1rZXktcGFpcmAgaXMgbm90IHlldCBDREsgdjIgY29tcGF0aWJsZVxuICAgIC8vIGNvbnN0IGtleSA9IG5ldyBLZXlQYWlyKHRoaXMsICdLZXlQYWlyJywge1xuICAgIC8vICAgbmFtZTogJ2Nkay1rZXlwYWlyJyxcbiAgICAvLyAgIGRlc2NyaXB0aW9uOiAnS2V5IFBhaXIgY3JlYXRlZCB3aXRoIENESyBEZXBsb3ltZW50JyxcbiAgICAvLyB9KTtcbiAgICAvLyBrZXkuZ3JhbnRSZWFkT25QdWJsaWNLZXlcblxuICAgIC8vIFB1dCB5b3VyIHB1YmxpYyBrZXkgaGVyZSwgc28gdGhhdCB5b3UgY2FuIFNTSCB0byB0aGUgRUMyIEluc3RhbmNlXG4gICAgY29uc3Qga2V5ID0gbmV3IEtleVBhaXIodGhpcywgJ1Rlc3QtS2V5LVBhaXInLCB7XG4gICAgICBuYW1lOiAnaW1wb3J0ZWQta2V5LXBhaXInLFxuICAgICAgcHVibGljS2V5OiAnc3NoLWVkMjU1MTkgQUFBQUMzTnphQzFsWkRJMU5URTVBQUFBSUdHQUZtWlFhdURwajhWbElML2cxMjJXVElOUWo3UFpoWUVlcjlrYVkyYlAnXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgbmV3IFZQQyB3aXRoIDIgU3VibmV0c1xuICAgIGNvbnN0IHZwYyA9IG5ldyBlYzIuVnBjKHRoaXMsICdWUEMnLCB7XG4gICAgICBuYXRHYXRld2F5czogMCxcbiAgICAgIHN1Ym5ldENvbmZpZ3VyYXRpb246IFt7XG4gICAgICAgIGNpZHJNYXNrOiAyNCxcbiAgICAgICAgbmFtZTogXCJhc3Rlcmlza1wiLFxuICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QVUJMSUNcbiAgICAgIH1dXG4gICAgfSk7XG5cbiAgICAvLyBBbGxvdyBTU0ggKFRDUCBQb3J0IDIyKSBhY2Nlc3MgZnJvbSBhbnl3aGVyZVxuICAgIGNvbnN0IHNlY3VyaXR5R3JvdXAgPSBuZXcgZWMyLlNlY3VyaXR5R3JvdXAodGhpcywgJ1NlY3VyaXR5R3JvdXAnLCB7XG4gICAgICB2cGMsXG4gICAgICBkZXNjcmlwdGlvbjogJ0FsbG93IFNTSCAoVENQIHBvcnQgMjIpIGluJyxcbiAgICAgIGFsbG93QWxsT3V0Ym91bmQ6IHRydWVcbiAgICB9KTtcbiAgICBzZWN1cml0eUdyb3VwLmFkZEluZ3Jlc3NSdWxlKGVjMi5QZWVyLmFueUlwdjQoKSwgZWMyLlBvcnQudGNwKDIyKSwgJ0FsbG93IFNTSCBBY2Nlc3MnKVxuXG4gICAgY29uc3Qgcm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnZWMyUm9sZScsIHtcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdlYzIuYW1hem9uYXdzLmNvbScpXG4gICAgfSlcblxuICAgIHJvbGUuYWRkTWFuYWdlZFBvbGljeShpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ0FtYXpvblNTTU1hbmFnZWRJbnN0YW5jZUNvcmUnKSlcblxuICAgIC8vIFVzZSBMYXRlc3QgQW1hem9uIExpbnV4IEltYWdlIC0gQ1BVIFR5cGUgQVJNNjRcbiAgICBjb25zdCBhbWkgPSBuZXcgZWMyLkFtYXpvbkxpbnV4SW1hZ2Uoe1xuICAgICAgZ2VuZXJhdGlvbjogZWMyLkFtYXpvbkxpbnV4R2VuZXJhdGlvbi5BTUFaT05fTElOVVhfMixcbiAgICAgIGNwdVR5cGU6IGVjMi5BbWF6b25MaW51eENwdVR5cGUuQVJNXzY0XG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgdGhlIGluc3RhbmNlIHVzaW5nIHRoZSBTZWN1cml0eSBHcm91cCwgQU1JLCBhbmQgS2V5UGFpciBkZWZpbmVkIGluIHRoZSBWUEMgY3JlYXRlZFxuICAgIGNvbnN0IGVjMkluc3RhbmNlID0gbmV3IGVjMi5JbnN0YW5jZSh0aGlzLCAnSW5zdGFuY2UnLCB7XG4gICAgICB2cGMsXG4gICAgICBpbnN0YW5jZVR5cGU6IGVjMi5JbnN0YW5jZVR5cGUub2YoZWMyLkluc3RhbmNlQ2xhc3MuVDRHLCBlYzIuSW5zdGFuY2VTaXplLk1JQ1JPKSxcbiAgICAgIG1hY2hpbmVJbWFnZTogYW1pLFxuICAgICAgc2VjdXJpdHlHcm91cDogc2VjdXJpdHlHcm91cCxcbiAgICAgIGtleU5hbWU6IGtleS5rZXlQYWlyTmFtZSxcbiAgICAgIHJvbGU6IHJvbGVcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBhbiBhc3NldCB0aGF0IHdpbGwgYmUgdXNlZCBhcyBwYXJ0IG9mIFVzZXIgRGF0YSB0byBydW4gb24gZmlyc3QgbG9hZFxuICAgIGNvbnN0IGFzc2V0ID0gbmV3IEFzc2V0KHRoaXMsICdBc3NldCcsIHsgcGF0aDogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3NyYy9jb25maWcuc2gnKSB9KTtcbiAgICBjb25zdCBsb2NhbFBhdGggPSBlYzJJbnN0YW5jZS51c2VyRGF0YS5hZGRTM0Rvd25sb2FkQ29tbWFuZCh7XG4gICAgICBidWNrZXQ6IGFzc2V0LmJ1Y2tldCxcbiAgICAgIGJ1Y2tldEtleTogYXNzZXQuczNPYmplY3RLZXksXG4gICAgfSk7XG5cbiAgICBlYzJJbnN0YW5jZS51c2VyRGF0YS5hZGRFeGVjdXRlRmlsZUNvbW1hbmQoe1xuICAgICAgZmlsZVBhdGg6IGxvY2FsUGF0aCxcbiAgICAgIGFyZ3VtZW50czogJy0tdmVyYm9zZSAteSdcbiAgICB9KTtcbiAgICBhc3NldC5ncmFudFJlYWQoZWMySW5zdGFuY2Uucm9sZSk7XG5cbiAgICAvLyBDcmVhdGUgb3V0cHV0cyBmb3IgY29ubmVjdGluZ1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdJUCBBZGRyZXNzJywgeyB2YWx1ZTogZWMySW5zdGFuY2UuaW5zdGFuY2VQdWJsaWNJcCB9KTtcbiAgICAvLyBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnS2V5IE5hbWUnLCB7IHZhbHVlOiBrZXkua2V5UGFpck5hbWUgfSlcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnRG93bmxvYWQgS2V5IENvbW1hbmQnLCB7IHZhbHVlOiAnYXdzIHNlY3JldHNtYW5hZ2VyIGdldC1zZWNyZXQtdmFsdWUgLS1zZWNyZXQtaWQgZWMyLXNzaC1rZXkvY2RrLWtleXBhaXIvcHJpdmF0ZSAtLXF1ZXJ5IFNlY3JldFN0cmluZyAtLW91dHB1dCB0ZXh0ID4gY2RrLWtleS5wZW0gJiYgY2htb2QgNDAwIGNkay1rZXkucGVtJyB9KVxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdzc2ggY29tbWFuZCcsIHsgdmFsdWU6ICdzc2ggLWkgY2RrLWtleS5wZW0gLW8gSWRlbnRpdGllc09ubHk9eWVzIGVjMi11c2VyQCcgKyBlYzJJbnN0YW5jZS5pbnN0YW5jZVB1YmxpY0lwIH0pXG4gIH1cbn1cbiJdfQ==