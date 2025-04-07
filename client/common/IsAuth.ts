const IsAuth = async (queryParams: any) => {

    const res = await fetch('http://localhost:3000/api/v1/auth/google/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: queryParams.user })
    });

    const data = await res.json();

}

export default IsAuth
