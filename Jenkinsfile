pipeline {
    agent any

    environment {
        BACKEND_BUILD_DIR = 'build/libs'           // JAR 파일이 위치한 디렉토리
        GIT_URL = 'https://lab.ssafy.com/s12-ai-image-sub1/S12P21A101.git'
        TARGET_SERVER_PATH = credentials('deploy-server-path')
        PUSHED_BRANCH = "${env.PUSHED_BRANCH}"
    }
    
    options {
        disableConcurrentBuilds()
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs() // workspace 정리
            }
        }

        stage('Conditional Execution') {
            steps {
                script {
                    if (env.PUSHED_BRANCH == 'refs/heads/master') {
                        echo 'MASTER BUILD'
                        checkoutCode('master', 'gitlab-authorization')
                        // buildSpringboot()
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}

def checkoutCode(String branchName, String credentialValue) {
    stage('Checkout') {
        dir(buildDir) {
            git branch: branchName, credentialsId: credentialValue, url: GIT_URL
        }
    }
}

def buildSpringboot(String targetJarFile, String shellScript) {
    stage('Build JAR') {
        sh "chmod +x gradlew"
        sh "./gradlew clean bootJar"
    }
    
    stage('Deploy on Server') {
        dir(BACKEND_BUILD_DIR) {
            sshagent(credentials: ['deploy-server-key']) {
                sh '''
                    scp -v -o StrictHostKeyChecking=no ./${targetJarFile} ${TARGET_SERVER_PATH}:/home/ubuntu
                    ssh -v -o StrictHostKeyChecking=no ${TARGET_SERVER_PATH} "bash /home/ubuntu/${shellScript}.sh"
                '''
            } 
        }
    }
}