pipeline {
    agent any

    environment {
        REGISTRY = 'registry.rotaris.ch'
        IMAGE_BACKEND = "${REGISTRY}/dev-website-backend"
        IMAGE_FRONTEND = "${REGISTRY}/dev-website-frontend"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    script {
                        sh 'docker build -t ${IMAGE_BACKEND}:${GIT_COMMIT} -t ${IMAGE_BACKEND}:latest .'
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    script {
                        sh 'docker build -t ${IMAGE_FRONTEND}:${GIT_COMMIT} -t ${IMAGE_FRONTEND}:latest .'
                    }
                }
            }
        }

        stage('Push Images') {
            steps {
                script {
                    sh '''
                        docker push ${IMAGE_BACKEND}:${GIT_COMMIT}
                        docker push ${IMAGE_BACKEND}:latest
                        docker push ${IMAGE_FRONTEND}:${GIT_COMMIT}
                        docker push ${IMAGE_FRONTEND}:latest
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    sh '''
                        kubectl rollout restart deployment/backend -n dev-website
                        kubectl rollout restart deployment/frontend -n dev-website
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
