# ONIST (CA) 2017 

* The node projects are checkedin with the node_modules as well. Since the dependecies are already pulled. The projects are self sufficient
* Persistence of the mongodb pod on restart is not taken care of. (It can be done by mapping volumes)
* Exponential retries for the db connection is not taken into account
* No security is build into the system.
* Docker images are build locally, it should ideally be driven out of Jenkins or CircleCI, However the images are available at 'thefenns' account on docker up.
* kubectl for kubernetes uploads keys to AWS from local machine. So all the deployment interaction happens from my mac
* UI is not pushed yet.
* The api-gateway is configured to internet facing load balancer. It is available at apigateway.jeevanvarughese.com
