pipeline {
    agent any

    environment {
        PROJECT_NAME = "django-react-ecommerce"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                url: 'https://github.com/Arij-Abid/Full-Stack_Django-React.git'
                sh 'ls -la'
            }
        }

        stage('Backend Test') {
            steps {
                dir('django-ecommerce') {
                    sh 'python3 -m venv venv'
                    sh '. venv/bin/activate && pip install -r requirements.txt'
                    sh '. venv/bin/activate && python manage.py check'
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('react-ecommerce-site') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker compose down || true'
                sh 'docker compose up -d'
            }
        }
    }

    post {
        success {
            echo 'Déploiement réussi'
        }

        failure {
            echo 'Échec du pipeline '
        }
    }
}
