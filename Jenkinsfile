pipeline {
    agent any

    environment {
        GIT_CRDENTIALS_ID = 'pavan-git'
        DOCKER_CREDENTIALS_ID = 'pavan-docker'
        DOCKER_REPO_FE = 'pavan050/project-fe'
        DOCKER_REPO_BE = 'pavan050/project-be'
    }

    stages {
        stage('Initialize Timestamp') {
            steps {
                script {
                    def timestamp = sh(script: "TZ='Asia/Kolkata' date +'%Y-%m-%d_%H-%M-%S'", returnStdout: true).trim()
                    env.IST_TIMESTAMP = timestamp
                    echo "Timestamp for entire job (IST): ${env.IST_TIMESTAMP}"
                }
            }
        }

        stage('Collecting code from repo') {
            steps {
                git (
                    credentialsId: "${GIT_CRDENTIALS_ID}",
                    url: 'https://github.com/pavan05000/testing-app.git',
                    branch: 'project'
                )
            }
        }

        stage('Code build through Docker') {
            steps {
                script {
                    def IMAGE_TAG = "v${env.BUILD_ID}_${env.IST_TIMESTAMP}"
                    echo "Using Image Tag: ${IMAGE_TAG}"

                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, passwordVariable: 'Docker_PASS', usernameVariable:'DOCKER_USER')]) {
                        sh "echo $Docker_PASS | docker login -u $DOCKER_USER --password-stdin"
                    }

                    sh """
                    docker build -t ${DOCKER_REPO_FE}:${IMAGE_TAG} .
                    docker tag ${DOCKER_REPO_FE}:${IMAGE_TAG} ${DOCKER_REPO_FE}:latest
                    docker push ${DOCKER_REPO_FE}:${IMAGE_TAG}
                    docker push ${DOCKER_REPO_FE}:latest
                    """
                    "Hello bro your code is build and pushed into the docker hub repo"
                }
            }
        }
        

        stage('Clean workspace') {
            steps {
                cleanWs()
            }
        }
    }
}

