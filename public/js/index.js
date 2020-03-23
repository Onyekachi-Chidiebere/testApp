$('#user').on('click',(e)=>{
        $('#nav-profile').toggle()
})
$('#regBtn').on('click',(e)=>{
        if($('#password').val()!==$('#confirmPassword').val()){
                e.preventDefault()
                $('.err').show()

                console.log('check password')
        }
})
const checkPassword =()=>{
        if($('#password').val()!==$('#confirmPassword').val()){
                $('#good').hide()
                $('#bad').show();
        }else{
                $('.err').hide()
                $('#bad').hide()
                $('#good').show()
        }
}
$('#confirmPassword').on('input',checkPassword)
$('#password').on('input',checkPassword)

