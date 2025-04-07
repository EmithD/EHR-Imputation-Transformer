export class IsAuth {

    SERVER_BASE_URL = 'http://localhost:3000';

    async isAuthenticated () {
        try {
          const queryParamsString = localStorage.getItem('queryParams');
          
          if (!queryParamsString) {
            console.log("No token found in localStorage");
            return {auth: false};
          }
  
          const queryParams = JSON.parse(queryParamsString);
          
          const res = await fetch(`${this.SERVER_BASE_URL}/api/v1/auth/google/user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: queryParams.user })
          });
  
          const data = await res.json();
  
          if (data.isAuthenticated) {
            console.log('User is authenticated');
            return {
                auth: true,
                userId: data.user.userId
            }
          } else {
            console.log('User is not authenticated');
            return {auth: false};
          }
        } catch (error) {
          console.error('Authentication check failed:', error);
          return {auth: false};
        }
    };

}