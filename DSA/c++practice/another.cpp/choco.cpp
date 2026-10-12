#include <iostream>
using namespace std;
int main(){
    int small,big,goal;
    
    cin>>small>>big>>goal;
    int abou = (big>goal/5)? (goal/5):big;
    int left = goal-5*abou;
    if (left<=small) cout<<left<<endl;
    else cout<<-1<<endl;
    return 0;
}