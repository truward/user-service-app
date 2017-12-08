package handlers

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
)

// GetIndexHandler returns function that handles HTTP (GET only) requests to the root path '/'
func GetIndexHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Serving index page (Not Found)")

		w.WriteHeader(http.StatusNotFound)
		w.Header().Set("Content-Type", "text/plain")
		w.Write([]byte("404 Not Found"))
	}
}

// LoginForm contains HTML page template containing login form
const LoginForm string = `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
  <title>Login</title>
</head>
<body>
<div class="well">
	<form method="POST" action="/login">
		<h3>Please Sign In</h3>

		<div>
			<label for="username-input" class="sr-only">Login</label>
			<input id="username-input" type="text" class="form-control" name="username" placeholder="Login" required autofocus />
		</div>
		<div>
			<label for="password-input" class="sr-only">Password</label>
			<input id="password-input" type="password" class="form-control" name="password" placeholder="Password" required />
		</div>
		<div>
			<label for="remember-me-input">
				<input id="remember-me-input" type="checkbox" name="remember-me" /><span>&nbsp;Remember Me</span>
			</label>
		</div>
		<input type="hidden" name="redirect-url" value="{{.RedirectURL}}" />
		<div class="button-holder">
			<input type="submit" class="btn btn-lg btn-primary btn-block" value="Login" />
		</div>
		<div class="button-holder">
			<input type="reset" class="btn btn-lg btn-warning btn-block" value="Reset" />
		</div>
	</form>
</div>
</body>
</html>
`

// GetLoginHandler returns function that handles HTTP (GET and POST) requests to the root path '/'
func GetLoginHandler() http.HandlerFunc {
	loginTemplate := template.New("loginPage")
	loginTemplate.Parse(LoginForm)
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case "POST":
			handleLoginPost(w, r)
		case "GET":
			serveLoginPage(w, r, loginTemplate)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	}
}

// Helper function that emits bad request response
func writeBadRequest(w http.ResponseWriter) {
	w.WriteHeader(http.StatusBadRequest)
	w.Header().Set("Content-Type", "text/plain")
	w.Write([]byte("Malformed request"))
}

//
// Login form, result of GET /login
//

type loginFormParameters struct {
	Username    string
	Password    string
	RedirectURL string
	RememberMe  bool
}

func (p *loginFormParameters) String() string {
	return fmt.Sprintf(
		"{Credentials=%s:%s, RememberMe=%t, RedirectUrl=%s}",
		p.Username,
		p.Password,
		p.RememberMe,
		p.RedirectURL)
}

func parseLoginFormParameters(w http.ResponseWriter, r *http.Request) (*loginFormParameters, bool) {
	e := r.ParseForm()
	if e != nil {
		writeBadRequest(w)
		return nil, false
	}

	// Form was successfully parsed, proceed with decoding the parameters
	f := r.PostForm
	username := f.Get("username")
	password := f.Get("password")
	redirectURL := f.Get("redirect-url")
	rememberMe := false
	if f.Get("remember-me") == "on" {
		rememberMe = true
	}

	return &loginFormParameters{
		Username:    username,
		Password:    password,
		RedirectURL: redirectURL,
		RememberMe:  rememberMe,
	}, true
}

func handleLoginPost(w http.ResponseWriter, r *http.Request) {
	params, ok := parseLoginFormParameters(w, r)
	if !ok {
		return
	}

	log.Printf("loginFormParameters=%s", params)

	var redirectURL string
	if params.Username == "testonly" && params.Password == "test" {
		// Credentials are OK
		redirectURL = params.RedirectURL + "?token=123"
	} else {
		// Wrong credentials
		// TODO: allow reentering credentials, redirect back to login page
		redirectURL = params.RedirectURL + "?error-code=login-failed"
	}

	http.Redirect(w, r, redirectURL, http.StatusFound)
}

//
// Login page, result of GET /login
//

type loginPageParameters struct {
	RedirectURL string
}

func (p *loginPageParameters) String() string {
	return fmt.Sprintf("{RedirectUrl=%s}", p.RedirectURL)
}

func parseLoginPageParameters(
	w http.ResponseWriter,
	r *http.Request,
) (*loginPageParameters, bool) {
	e := r.ParseForm()
	if e != nil {
		writeBadRequest(w)
		return nil, false
	}

	// Form was successfully parsed, proceed with decoding the parameters
	redirectURL := r.Form.Get("redirect-url")

	// Check if redirect URL is missing or not an URL
	// TODO: check against simple URL regex or use other means to verify that it is indeed an URL
	if len(redirectURL) == 0 {
		writeBadRequest(w)
		return nil, false
	}

	return &loginPageParameters{
		RedirectURL: redirectURL,
	}, true
}

func serveLoginPage(
	w http.ResponseWriter,
	r *http.Request,
	loginTemplate *template.Template) {
	params, ok := parseLoginPageParameters(w, r)
	if !ok {
		return
	}

	log.Printf("loginPageParameters=%s", params)

	w.Header().Set("Content-Type", "text/html")

	err := loginTemplate.ExecuteTemplate(w, "loginPage", params)
	if err != nil {
		log.Printf("Unable to render template, error=%s", err)
		return
	}
}
