
// export const fetchUserData = () => {

//     const cachedUserData = sessionStorage.getItem('userData');
    
//     if (cachedUserData) {
//       setUserData(JSON.parse(cachedUserData));
//       return;
//     }
    
//     const getUser = async () => {
//       try {
//         const queryParamsString = localStorage.getItem('queryParams');
        
//         if (!queryParamsString) {
//           console.log("No token found in localStorage");
//           setUserData(prev => ({...prev, isLoading: false}));
//           return;
//         }

//         const queryParams = JSON.parse(queryParamsString);

//         const res = await fetch('http://localhost:3000/api/v1/auth/google/user', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({ token: queryParams.user })
//         });
        
//         const data = await res.json();

//         const newUserData = {
//           userName: data.isAuthenticated ? data.user.displayName : '',
//           avatar: data.isAuthenticated ? data.user.avatarUrl : '',
//           isLoading: false,
//           isAuthenticated: data.isAuthenticated
//         };

//         sessionStorage.setItem('userData', JSON.stringify(newUserData));
//         setUserData(newUserData);
        
//         if (data.isAuthenticated) {
//           console.log('User is authenticated');
//         } else {
//           console.log('User is not authenticated');
//           window.location.href = '/auth/login';
//         }
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//         setUserData(prev => ({...prev, isLoading: false}));
//       }
//     };

// }

